'use client';

import React, { useEffect, useState } from 'react';
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView,
  AgendaView,
  SchedulerDataChangeEvent,
  SchedulerItem,
  SchedulerItemProps,
  SchedulerForm,
  SchedulerFormProps,
  SchedulerFormEditor,
} from '@progress/kendo-react-scheduler';
import styles from './page.module.css';

import Header from './header';
import { Card, CardBody, CardTitle } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import Link from 'next/link';

import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const CustomItem = ({ dataItem, currentUserId, ...others }: SchedulerItemProps & { currentUserId: string | null }) => {
  if (!dataItem) return null;

  const isOwner = dataItem.createdBy === currentUserId;

  const style = {
    backgroundColor: isOwner ? undefined : '#ddd',
    color: isOwner ? undefined : '#555',
    fontStyle: isOwner ? undefined : 'italic',
    cursor: isOwner ? 'pointer' : 'default',
  };

  // Render the SchedulerItem but override title display with a span if not owner
  return (
    <SchedulerItem {...others} dataItem={dataItem} className={isOwner ? '' : styles.readonly} style={style}>
      { !isOwner ? (
        <div style={{ padding: '4px', fontStyle: 'italic', color: '#555' }}>
          Busy
        </div>
      ) : (
        dataItem.title
      )}
    </SchedulerItem>
  );
};

const CustomFormEditor = () => <p>Cannot edit appointments you did not create.</p>;

const CustomEditForm = (props: SchedulerFormProps & { currentUserId: string | null }) => {
  const { dataItem, currentUserId, ...rest } = props;
  const isOwner = dataItem?.createdBy === currentUserId || dataItem?.createdBy === undefined;

  return (
    <SchedulerForm
      {...rest}
      dataItem={dataItem}
      editor={isOwner ? SchedulerFormEditor : CustomFormEditor}
    />
  );
};

function LoginCard({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
      <Card style={{ width: 360, padding: '2rem' }}>
        <CardBody>
          <CardTitle style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            Log In
          </CardTitle>
          <form onSubmit={handleSubmit}>
            <div className="k-form-field" style={{ marginBottom: '1rem' }}>
              <label>Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.value)}
                required
              />
            </div>
            <div className="k-form-field" style={{ marginBottom: '1.5rem' }}>
              <label>Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.value)}
                required
              />
            </div>
            <Button type="submit" themeColor="primary" style={{ width: '100%' }}>
              Log In
            </Button>
            <br /><br />
            <Link href={'/createAccount'} style={{ textDecoration: 'underline' }}>Create an account</Link>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function WorkingScheduler() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setEvents([]); // clear events on logout
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to all appointments in the collection, regardless of creator
    const q = query(collection(db, 'appointments'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          start: data.start.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end.toDate ? data.end.toDate() : new Date(data.end),
          description: data.description,
          createdBy: data.createdBy,
        };
      });
      setEvents(appointments);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      alert('Login failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDataChange = async (e: SchedulerDataChangeEvent) => {
    if (!currentUserId) return;

    const created = e.created || [];
    const updated = e.updated || [];
    const deleted = e.deleted || [];

    try {
      for (const appt of deleted) {
        // Only allow deleting appointments owned by current user
        if (appt.createdBy === currentUserId) {
          await deleteDoc(doc(db, 'appointments', appt.id));
        }
      }

      for (const appt of updated) {
        if (appt.id && appt.createdBy === currentUserId) {
          await updateDoc(doc(db, 'appointments', appt.id), {
            title: appt.title,
            start: appt.start,
            end: appt.end,
            description: appt.description || '',
          });
        }
      }

      for (const appt of created) {
        await addDoc(collection(db, 'appointments'), {
          title: appt.title,
          start: appt.start,
          end: appt.end,
          description: appt.description || '',
          createdBy: currentUserId,
        });
      }
    } catch (error) {
      console.error('Error syncing appointments with Firestore:', error);
      alert('Error saving appointments. Please try again.');
    }
  };

  if (!currentUserId) {
    return <LoginCard onLogin={handleLogin} />;
  }

  return (
    <>
      <Header userID={currentUserId} />
      <Scheduler
        data={events}
        onDataChange={handleDataChange}
        form={(props) => <CustomEditForm {...props} currentUserId={currentUserId} />}
        editable={{ add: true, edit: true, remove: true, drag: true, resize: true, select: true }}
        dataItemKey="id"
        modelFields={{
          id: 'id',
          title: 'title',
          start: 'start',
          end: 'end',
          description: 'description',
          createdBy: 'createdBy',
        }}
        item={(props) => <CustomItem {...props} currentUserId={currentUserId} />}
        height={'90vh'}
      >
        <DayView />
        <WeekView />
        <MonthView />
      </Scheduler>
    </>
  );
}
