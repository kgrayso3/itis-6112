'use client';

import React, { useState } from 'react';
import { Input } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Card } from '@progress/kendo-react-layout';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function addUserToFirestore(uid, email) {
    try {
        await addDoc(collection(db, 'users'), {
            uid,
            email,
        });
        console.log('User added to Firestore');
        return true;
    } catch (error) {
        console.error('Error adding user to Firestore:', error);
        return false;
    }
}

export default function CreateAccount() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert('Email and password are required.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await addUserToFirestore(user.uid, email);

            setEmail('');
            setPassword('');
            alert('Account created successfully!');
        } catch (error) {
            console.error('Firebase Auth error:', error);
            alert(error.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
            <Card style={{ width: 360, padding: '2rem' }}>
                <h1 className="text-2xl font-semibold text-center">Create an Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className="pt-4">
                        <br/>
                        <Button type="submit" themeColor="primary" fillMode="solid" disabled={loading}>
                            {loading ? 'Creating...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
