'use client';

import React, { useState, useCallback } from 'react';
import {
  Scheduler,
  DayView,
  SchedulerDataChangeEvent,
  SchedulerItem,
  SchedulerItemProps,
  SchedulerForm,
  SchedulerFormEditorProps,
  SchedulerFormProps,
  SchedulerFormEditor
} from '@progress/kendo-react-scheduler';
import { guid } from '@progress/kendo-react-common';
import { Input } from '@progress/kendo-react-inputs';
import { DatePicker } from '@progress/kendo-react-dateinputs';

import styles from './page.module.css';

const currentUserId = 'user123';

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

// Custom item styling for read-only events
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
      <p>Cannot edit events you do not own</p>
    );
};

export const CustomEditForm = (props: SchedulerFormProps) => {

    const dataItem = props.dataItem;
    const isOwner = dataItem?.createdBy === currentUserId;

    return (
      <SchedulerForm
        {...props}
        editor={ isOwner ? SchedulerFormEditor : CustomFormEditor}
        />
    );
};

export default function WorkingScheduler() {
  const [events, setEvents] = useState(initialData);

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

  return (
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
      height={600}
    >
      <DayView />
    </Scheduler>
  );
}
