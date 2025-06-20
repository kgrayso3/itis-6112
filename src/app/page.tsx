'use client';

import React, { useState } from 'react';
import {
  Scheduler,
  DayView,
  SchedulerDataChangeEvent,
  SchedulerEditItemProps
} from '@progress/kendo-react-scheduler';
import { guid } from '@progress/kendo-react-common';

const currentUserId = 'user123';

const initialData = [
  {
    id: 1,
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60000),
    title: 'User 456 appointment',
    createdBy: 'user456'
  },
  {
    id: 2,
    start: new Date(new Date().getTime() + 60 * 60000),
    end: new Date(new Date().getTime() + 90 * 60000),
    title: 'Your appointment',
    createdBy: 'user123'
  }
];

export default function WorkingScheduler() {
  const [events, setEvents] = useState(initialData);
  const [editItem, setEditItem] = useState<SchedulerEditItemProps['dataItem'] | null>(null);

  const handleEdit = (e: SchedulerEditItemProps) => {
    setEditItem(e.dataItem);
  };

  const handleDataChange = (e: SchedulerDataChangeEvent) => {
    console.log('Data change event:', e);
    const created = e.created || [];
    const updated = e.updated || [];
    const deleted = e.deleted || [];

    console.log('Created:', created);
    console.log('Updated:', updated);
    console.log('Deleted:', deleted);

    setEvents(prev => {
      const deletedIds = new Set(deleted.map(d => d.id));
      const updatedMap = new Map(updated.map(u => [u.id, u]));

      const preserved = prev
        .filter(ev => !deletedIds.has(ev.id))
        .map(ev => {
          const updatedItem = updatedMap.get(ev.id);
          if (updatedItem && ev.createdBy === currentUserId) {
            return { ...updatedItem, createdBy: ev.createdBy };
          }
          return ev;
        });

      const newCreated = created.map(c => ({
        ...c,
        id: guid(),
        createdBy: currentUserId
      }));

      return [...preserved, ...newCreated];
    });

    setEditItem(null);
  };

  return (
    <Scheduler
      data={events}
      onDataChange={handleDataChange}
      onEdit={handleEdit}
      editItem={editItem}
      editable={{ add: true, edit: true, remove: true }}
      dataItemKey="id"
      modelFields={{
        id: 'id',
        title: 'title',
        start: 'start',
        end: 'end',
        createdBy: 'createdBy'
      }}
      height={600}
    >
      <DayView />
    </Scheduler>
  );
}
