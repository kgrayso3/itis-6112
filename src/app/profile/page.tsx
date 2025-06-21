'use client'

import React, { useState } from 'react';
import { Input, Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Window } from '@progress/kendo-react-dialogs';  // import Window
import Header from '../header';

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
    title: 'Your appointment',
    createdBy: 'user123',
  },
  {
    id: 3,
    start: new Date('2025-06-21T10:00:00'),
    end: new Date('2025-06-21T10:30:00'),
    title: 'A second appointment',
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

  const currentUserId = 'user123';

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notesByAppointmentId, setNotesByAppointmentId] = useState({} as Record<number, string>);

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
    // TO_DO: update DB with new user info  
  };

  const handleLogout = () => {
    console.log('User logged out');
    // TO_DO: implement logout logic 
  };

  const userAppointments = initialData
    .filter(appt => appt.createdBy === currentUserId)
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  const handleAppointmentClick = (appt) => {
    setSelectedAppointment(appt);
  };

  const handleWindowClose = () => {
    setSelectedAppointment(null);
  };

  const handleNotesChange = (e) => {
    if (!selectedAppointment) return;
    const val = e.target.value;
    setNotesByAppointmentId(prev => ({
      ...prev,
      [selectedAppointment.id]: val
    }));

    // TO_DO: update appt notes in DB on save 
  };

  return (
    <>
      <Header />
      <section style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2>User Profile Settings</h2>

          {isEditing ? (
            <>
              <div className="k-form-field">
                <label>Name</label>
                <Input
                  value={draft.name}
                  onChange={e => setDraft(d => ({ ...d, name: e.value }))}
                  required
                />
              </div>

              <div className="k-form-field">
                <label>Age</label>
                <Input
                  type="number"
                  value={draft.age ? draft.age.toString() : ''}
                  onChange={e => setDraft(d => ({ ...d, age: Number(e.value) }))}
                  min={1}
                  required
                />
              </div>

              <div className="k-form-field">
                <label>Notification Settings</label>
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

              <div>
                <Button onClick={handleSave} primary>
                  Save Changes
                </Button>
                <Button onClick={handleCancelClick} style={{ marginLeft: 8 }}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {name || '(not set)'}</p>
              <p><strong>Age:</strong> {age || '(not set)'}</p>
              <p><strong>Notifications:</strong></p>
              <ul>
                <li>Email Alerts: {emailAlerts ? 'Yes' : 'No'}</li>
                <li>Text Alerts: {textAlerts ? 'Yes' : 'No'}</li>
              </ul>
              <Button onClick={handleEditClick} primary>
                Edit Profile
              </Button>
            </>
          )}

          <div>
            <Button onClick={handleLogout} style={{ marginTop: '40px' }}>
              Log Out
            </Button>
          </div>
        </div>

        <aside style={{ width: 350 }}>
          <h2>Past Appointments</h2>
          {userAppointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {userAppointments.map(appt => (
                <li
                  key={appt.id}
                  style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', cursor: 'pointer' }}
                  onClick={() => handleAppointmentClick(appt)}
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
                    {appt.start.toLocaleString()} - {appt.end.toLocaleTimeString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {selectedAppointment && (
          <Window
            title={`Appointment Details - ${selectedAppointment.title}`}
            onClose={handleWindowClose}
            initialWidth={400}
            initialHeight={350}
            modal={true}
          >
            <div style={{ padding: 12 }}>
              <p><strong>Start:</strong> {selectedAppointment.start.toLocaleString()}</p>
              <p><strong>End:</strong> {selectedAppointment.end.toLocaleString()}</p>
              <p><strong>Title:</strong> {selectedAppointment.title}</p>

              <label htmlFor="notes"><strong>Notes:</strong></label>
              <textarea
                id="notes"
                style={{ width: '100%', minHeight: 100, marginTop: 4 }}
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
