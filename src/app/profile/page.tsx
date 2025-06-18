'use client'

import React, { useState } from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import Header from '../header';

export default function Profile () {

    const [name, setName] = useState('');
    const [age, setAge] = useState(0);
    const [emailAlerts, setEmailAlerts] = useState(false);
    const [textAlerts, setTextAlerts] = useState(false);

    const handleSave = () => {
        const profileData = {
            name,
            age,
            emailAlerts,
            textAlerts,
        };
        console.log('User profile updated:', profileData);
        // TO_DO: update DB with new user info  
    };

    const handleLogout = () => {
        console.log('User logged out');
        // TO_DO: implement logout logic 
    };

    return (
      <>
      <Header/>
      {console.log(emailAlerts, textAlerts)}
      <section>
            <h2>User Profile Settings</h2>
            <div className="k-form-field">
                <label>Name</label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.value)}
                    required
                />
            </div>
            <div className="k-form-field">
                <label>Age</label>
                <Input
                    value={age ? age.toString() : ''}
                    type="number"
                    onChange={(e) => setAge(Number(e.value))}
                    required
                    min={1}
                />
            </div>
            <div className="k-form-field">
                <label>Notification Settings</label>
                <div>
                    <Checkbox
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.value)}
                        label="Opt-in to email alerts"
                    />
                    <Checkbox
                        checked={textAlerts}
                        onChange={(e) => setTextAlerts(e.value)}
                        label="Opt-in to text alerts"
                    />
                    <br/>
                </div>
            </div>
            <div>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
            <div>
                 <Button onClick={handleLogout} style={{ marginTop: '40px' }}>
                    Log Out
                </Button>
            </div>
            </section>
</>
    );
};
