'use client';

import React, { useState } from 'react';
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
import { guid } from '@progress/kendo-react-common';
import styles from './page.module.css';

import Header from './header';
import { Card, CardBody, CardTitle } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import Link from 'next/link';

import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Example static event data
const initialData = [
  {
    id: 1,
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60000),
    title: 'Another user’s appointment',
    createdBy: 'user456',
  },
  {
    id: 2,
    start: new Date(new Date().getTime() + 60 * 60000),
    end: new Date(new Date().getTime() + 90 * 60000),
    title: 'Your appointment',
    createdBy: 'user123', // this will be replaced once logged in
  },
];

const CustomItem = ({ dataItem, currentUserId, ...others }: SchedulerItemProps & { currentUserId: string | null }) => {
  if (!dataItem) return null;

  const isOwner = dataItem.createdBy === currentUserId;

  const style = {
    backgroundColor: isOwner ? undefined : '#ddd',
    color: isOwner ? undefined : '#555',
    fontStyle: isOwner ? undefined : 'italic',
    cursor: isOwner ? 'pointer' : 'default',
  };

  return (
    <SchedulerItem
      {...others}
      dataItem={dataItem}
      className={isOwner ? '' : styles.readonly}
      style={style}
    />
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
  const [events, setEvents] = useState(initialData);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setCurrentUserId(user.uid);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDataChange = (e: SchedulerDataChangeEvent) => {
    if (!currentUserId) return;

    const created = e.created || [];
    const updated = e.updated || [];
    const deleted = e.deleted || [];

    setEvents((prev) => {
      const deletedIds = new Set(deleted.map((d) => d.id));
      const updatedMap = new Map(updated.map((u) => [u.id, u]));

      const preserved = prev
        .filter((ev) => !deletedIds.has(ev.id))
        .map((ev) => {
          const updatedItem = updatedMap.get(ev.id);
          if (updatedItem && ev.createdBy === currentUserId) {
            return { ...updatedItem, createdBy: ev.createdBy };
          }
          return ev;
        });

      const newCreated = created.map((c) => ({
        ...c,
        id: guid(),
        createdBy: currentUserId,
      }));

      return [...preserved, ...newCreated];
    });
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
        editable={{ add: true, edit: true, remove: true }}
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
        <AgendaView />
      </Scheduler>
    </>
  );
}
