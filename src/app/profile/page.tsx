'use client'

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input, Checkbox, InputPrefix, TextBox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Window } from '@progress/kendo-react-dialogs';
import Header from '../header';
import { SvgIcon } from '@progress/kendo-react-common';
import { searchIcon } from '@progress/kendo-svg-icons';
import Link from 'next/link';



const initialData = [
  {
    id: 1,
    start: new Date('2025-06-20T09:00:00'),
    end: new Date('2025-06-20T09:30:00'),
    title: 'User 456 appointment',
    createdBy: 'user456',
  },
  {
    id: 2,
    start: new Date('2025-06-21T10:00:00'),
    end: new Date('2025-06-21T10:30:00'),
    title: 'Bloodwork',
    createdBy: 'user123',
  },
  {
    id: 3,
    start: new Date('2025-06-21T11:00:00'),
    end: new Date('2025-06-21T11:30:00'),
    title: 'Checkup',
    createdBy: 'user123',
  },
  {
    id: 4,
    start: new Date('2025-06-21T13:00:00'),
    end: new Date('2025-06-21T13:30:00'),
    title: 'Fever Follow-up',
    createdBy: 'user123',
  },
];

export default function Profile() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [textAlerts, setTextAlerts] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name, age, emailAlerts, textAlerts });

  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const router = useRouter();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notesByAppointmentId, setNotesByAppointmentId] = useState({} as Record<number, string>);
  const [searchTerm, setSearchTerm] = useState('');
  

  const handleEditClick = () => {
    setDraft({ name, age, emailAlerts, textAlerts });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setName(draft.name);
    setAge(draft.age);
    setEmailAlerts(draft.emailAlerts);
    setTextAlerts(draft.textAlerts);
    setIsEditing(false);

    console.log('User profile updated:', draft);
  };

  

  const handleLogout = () => {
    router.push('/createAccount');
    console.log('User logged out');
  };

  const userAppointments = initialData
    .filter(appt => appt.createdBy === userId)
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  const filteredAppointments = userAppointments.filter(appt =>
    appt.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAppointmentClick = (appt) => setSelectedAppointment(appt);

  const handleWindowClose = () => setSelectedAppointment(null);

  const handleNotesChange = (e) => {
    if (!selectedAppointment) return;
    setNotesByAppointmentId(prev => ({
      ...prev,
      [selectedAppointment.id]: e.target.value
    }));
  };

  return (
    <>
    { !userId && 
        <div style={{width: '100%', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
         <Link href="/"><Button themeColor={'primary'}>Return to Login Page</Button></Link>
        </div>
    }
    { userId && 
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
                  onChange={e => setDraft(d => ({ ...d, name: e.value }))}
                />
              </div>

              <div className="k-form-field" style={{ marginBottom: '1rem' }}>
                <label className="k-label">Age</label>
                <Input
                  type="number"
                  value={draft.age ? draft.age.toString() : ''}
                  onChange={e => setDraft(d => ({ ...d, age: Number(e.value) }))}
                  min={1}
                />
              </div>

              <div className="k-form-field" style={{ marginBottom: '1rem' }}>
                <label className="k-label">Notifications</label>
                <div>
                  <Checkbox
                    checked={draft.emailAlerts}
                    onChange={e => setDraft(d => ({ ...d, emailAlerts: e.value }))}
                    label="Opt-in to email alerts"
                  />
                  <Checkbox
                    checked={draft.textAlerts}
                    onChange={e => setDraft(d => ({ ...d, textAlerts: e.value }))}
                    label="Opt-in to text alerts"
                  />
                </div>
              </div>

                <div style={{maxWidth: '50%'}}>
              <Button onClick={handleSave} themeColor="primary">
                Save Changes
              </Button>
              <Button onClick={handleCancelClick}>
                Cancel
              </Button>
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

            {!isEditing && 
            <Button onClick={handleEditClick} themeColor="primary">
                Edit Profile
              </Button>
              }

<br/><br/>

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
            onChange={e => setSearchTerm(e.value)}
            style={{ marginBottom: '1rem' }}
          />

          {filteredAppointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {filteredAppointments.map(appt => (
                <li
                  key={appt.id}
                  onClick={() => handleAppointmentClick(appt)}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                  }}
                  tabIndex={0}
                  onKeyDown={e => {
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
                  Close
                </Button>
              </div>
            </div>
          </Window>
        )}
      </section>
    </>
    }
      </>
  );
}
