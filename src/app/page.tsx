'use client';

import React, { useState } from 'react';
import {
  Scheduler,
  DayView,
  SchedulerDataChangeEvent,
  SchedulerItem,
  SchedulerItemProps,
  SchedulerForm,
  SchedulerFormProps,
  SchedulerFormEditor,
  WeekView,
  MonthView,
  AgendaView
} from '@progress/kendo-react-scheduler';

import { guid } from '@progress/kendo-react-common';

import styles from './page.module.css';
import Header from './header';
import { Card, CardBody, CardTitle } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';

//TO_DO: Update with userID from DB 
const currentUserId = 'user123';

//TO_DO: Update with events saved to DB 
const initialData = [
  {
    id: 1,
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60000),
    title: 'User 456 appointment',
    createdBy: 'user456',
  },
  {
    id: 2,
    start: new Date(new Date().getTime() + 60 * 60000),
    end: new Date(new Date().getTime() + 90 * 60000),
    title: 'Your appointment',
    createdBy: 'user123',
  },
];

const CustomItem = (props: SchedulerItemProps) => {
  const { dataItem, ...others } = props;

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
 
export const CustomFormEditor = () => {
    return (
      <p>Cannot edit appointments you did not create.</p>
    );
};

export const CustomEditForm = (props: SchedulerFormProps) => {

    const dataItem = props.dataItem;
    const isOwner = dataItem?.createdBy === currentUserId || dataItem?.createdBy === undefined;

    console.log(dataItem?.createdBy)

    return (
      <SchedulerForm
        {...props}
        editor={ isOwner ? SchedulerFormEditor : CustomFormEditor}
        />
    );
};

export default function WorkingScheduler() {
  const [events, setEvents] = useState(initialData);
  const [loggedIn, setLoggedIn] = useState(true);
  const [loginInput, setLoginInput] = useState('');

  const handleLogin = () => {
    if (loginInput.trim().toLowerCase() === 'user123') {
      setLoggedIn(true);
    } else {
      alert('Invalid username');
    }
  };

  const handleDataChange = (e: SchedulerDataChangeEvent) => {
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

  function LoginCard({ onLogin }: { onLogin: (username: string, password: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
      <Card style={{ width: 360, padding: '2rem' }}>
        <CardBody>
          <CardTitle style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            Please log in
          </CardTitle>
          <form onSubmit={handleSubmit}>
            <div className="k-form-field" style={{ marginBottom: '1rem' }}>
              <label>Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.value)}
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
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

  return (
    <>

    {!loggedIn && 
      <LoginCard onLogin={(user, pass) => {
        console.log('Logging in with:', user, pass);
        // TO_DO: authentication logic
      }} />
    }

    { loggedIn && 
      <>
        <Header/>
        <Scheduler
          data={events}
          onDataChange={handleDataChange}
          form={CustomEditForm}
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
          item={CustomItem}
          height={'90vh'}
        >
          <DayView />
          <WeekView/>
          <MonthView/>
          <AgendaView /> 
        </Scheduler>
      </>
    }
    </>
  );
}
