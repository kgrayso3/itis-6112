'use client';

import React, { useEffect, useState } from 'react';
import { Input, Checkbox, InputPrefix, TextBox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Window } from '@progress/kendo-react-dialogs';
import { SvgIcon } from '@progress/kendo-react-common';
import { searchIcon } from '@progress/kendo-svg-icons';
import { useRouter } from 'next/navigation';

import Header from '../header';

import { auth, db } from '../firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [textAlerts, setTextAlerts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', age: 0, emailAlerts: false, textAlerts: false });

  const [appointments, setAppointments] = useState<any[]>([]); // Will hold appointments loaded from Firestore
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [notesByAppointmentId, setNotesByAppointmentId] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // Load user profile
        const docRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(docRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || '');
          setAge(data.age || 0);
          setEmailAlerts(data.emailAlerts || false);
          setTextAlerts(data.textAlerts || false);
        }
        // Subscribe to user's appointments collection
        const userAppointmentsRef = doc(db, 'users', user.uid);
        // Instead of querying appointments here, let's fetch appointments collection filtered by userId
        // We'll fetch all appointments for this user once:
        const fetchAppointments = async () => {
          try {
            const apptsSnap = await getAppointmentsForUser(user.uid);
            setAppointments(apptsSnap);
            // Initialize notesByAppointmentId from fetched data
            const notesMap: Record<string, string> = {};
            apptsSnap.forEach((appt) => {
              notesMap[appt.id] = appt.description || '';
            });
            setNotesByAppointmentId(notesMap);
          } catch (error) {
            console.error('Error fetching appointments:', error);
          }
        };
        fetchAppointments();
      } else {
        setUserId(null);
        setAppointments([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Helper: fetch appointments from 'appointments' collection filtered by userId
  const getAppointmentsForUser = async (uid: string) => {
    // Firestore query to get all appointments where createdBy === uid
    // We need to import collection, query, where, getDocs
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const appointmentsCol = collection(db, 'appointments');
    const q = query(appointmentsCol, where('createdBy', '==', uid));
    const querySnapshot = await getDocs(q);
    const appts: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      appts.push({
        id: docSnap.id,
        title: data.title,
        start: data.start.toDate ? data.start.toDate() : new Date(data.start),
        end: data.end.toDate ? data.end.toDate() : new Date(data.end),
        createdBy: data.createdBy,
        description: data.description || '',
      });
    });
    return appts;
  };

  const handleEditClick = () => {
    setDraft({ name, age, emailAlerts, textAlerts });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    const updatedProfile = {
      name: draft.name,
      age: draft.age,
      emailAlerts: draft.emailAlerts,
      textAlerts: draft.textAlerts,
    };

    try {
      if (userId) {
        await setDoc(doc(db, 'users', userId), updatedProfile, { merge: true });
        setName(draft.name);
        setAge(draft.age);
        setEmailAlerts(draft.emailAlerts);
        setTextAlerts(draft.textAlerts);
        setIsEditing(false);
        console.log('User profile updated:', updatedProfile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out');
    }
  };

  const filteredAppointments = appointments
    .filter((appt) =>
      appt.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  const handleAppointmentClick = (appt: any) => setSelectedAppointment(appt);

  // Save notes to Firestore
  const saveNotesToFirestore = async (appointmentId: string, notes: string) => {
    if (!appointmentId) return;
    try {
      const apptDocRef = doc(db, 'appointments', appointmentId);
      await updateDoc(apptDocRef, { description: notes });
      // Update local state as well
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, description: notes } : appt
        )
      );
      console.log('Notes saved for appointment', appointmentId);
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes.');
    }
  };

  const handleWindowClose = () => {
    if (selectedAppointment) {
      const currentNotes = notesByAppointmentId[selectedAppointment.id] || '';
      saveNotesToFirestore(selectedAppointment.id, currentNotes);
    }
    setSelectedAppointment(null);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedAppointment) return;
    setNotesByAppointmentId((prev) => ({
      ...prev,
      [selectedAppointment.id]: e.target.value,
    }));
  };

  if (!userId) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          padding: '2rem',
        }}
      >
        {/* Profile Card */}
        <div
          className="k-card"
          style={{
            flex: 1,
            padding: '24px',
            borderRadius: '12px',
            boxShadow: 'var(--kendo-box-shadow-depth-1)',
            backgroundColor: 'var(--kendo-component-bg)',
            minWidth: '300px',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>User Profile</h2>

          {isEditing ? (
            <>
              <div className="k-form-field" style={{ marginBottom: '1rem' }}>
                <label className="k-label">Name</label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.value }))}
                />
              </div>

              <div className="k-form-field" style={{ marginBottom: '1rem' }}>
                <label className="k-label">Age</label>
                <Input
                  type="number"
                  value={draft.age ? draft.age.toString() : ''}
                  onChange={(e) => setDraft((d) => ({ ...d, age: Number(e.value) }))}
                  min={1}
                />
              </div>

              <div className="k-form-field" style={{ marginBottom: '1rem' }}>
                <label className="k-label">Notifications</label>
                <div>
                  <Checkbox
                    checked={draft.emailAlerts}
                    onChange={(e) => setDraft((d) => ({ ...d, emailAlerts: e.value }))}
                    label="Opt-in to email alerts"
                  />
                  <Checkbox
                    checked={draft.textAlerts}
                    onChange={(e) => setDraft((d) => ({ ...d, textAlerts: e.value }))}
                    label="Opt-in to text alerts"
                  />
                </div>
              </div>

              <div style={{ maxWidth: '50%' }}>
                <Button onClick={handleSave} themeColor="primary">
                  Save Changes
                </Button>
                <Button onClick={handleCancelClick}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <p><b>Name:</b> {name || '(not set)'}</p>
              <p><b>Age:</b> {age || '(not set)'}</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Notifications:</strong>
                <ul style={{ marginTop: 4, marginLeft: 20 }}>
                  <li>Email Alerts: {emailAlerts ? 'Yes' : 'No'}</li>
                  <li>Text Alerts: {textAlerts ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </>
          )}

          <div style={{ marginTop: '2rem' }}>
            {!isEditing && (
              <Button onClick={handleEditClick} themeColor="primary">
                Edit Profile
              </Button>
            )}

            <br /><br />

            <Button onClick={handleLogout} themeColor="dark">
              Log Out
            </Button>
          </div>
        </div>

        {/* Appointments Card */}
        <div
          className="k-card"
          style={{
            width: '375px',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: 'var(--kendo-box-shadow-depth-1)',
            backgroundColor: 'var(--kendo-component-bg)',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Past Appointments</h2>

          <TextBox
            prefix={() => (
              <InputPrefix>
                <SvgIcon icon={searchIcon} style={{ color: 'black' }} />
              </InputPrefix>
            )}
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(String(e.value ?? ''))}
            style={{ marginBottom: '1rem' }}
          />

          {filteredAppointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {filteredAppointments.map((appt) => (
                <li
                  key={appt.id}
                  onClick={() => handleAppointmentClick(appt)}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleAppointmentClick(appt);
                    }
                  }}
                  role="button"
                  aria-label={`Open details for appointment ${appt.title}`}
                >
                  <strong>{appt.title}</strong><br />
                  <small>
                    {appt.start.toLocaleString()} – {appt.end.toLocaleTimeString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedAppointment && (
          <Window
            title={`Appointment Details - ${selectedAppointment.title}`}
            onClose={handleWindowClose}
            initialWidth={400}
            initialHeight={350}
            modal
          >
            <div style={{ padding: '1rem' }}>
              <p><strong>Start:</strong> {selectedAppointment.start.toLocaleString()}</p>
              <p><strong>End:</strong> {selectedAppointment.end.toLocaleString()}</p>
              <p><strong>Title:</strong> {selectedAppointment.title}</p>

              <label htmlFor="notes"><strong>Notes:</strong></label>
              <textarea
                id="notes"
                style={{
                  width: '100%',
                  minHeight: 100,
                  marginTop: 4,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
                value={notesByAppointmentId[selectedAppointment.id] || ''}
                onChange={handleNotesChange}
              />
              <div style={{ marginTop: 12 }}>
                <Button onClick={handleWindowClose} themeColor={'primary'}>
                  Save
                </Button>
              </div>
            </div>
          </Window>
        )}
      </section>
    </>
  );
}
