"use client"
import React from 'react'

import { Button } from "@progress/kendo-react-buttons";
import { Scheduler, DayView, WeekView, WorkWeekView, AgendaView, MonthView, SchedulerResource } from '@progress/kendo-react-scheduler';

import { sampleData } from "./sampleData"; //TO-DO replace with actual user schedule data from DB 

import AppHeader from './header';

import styles from "./page.module.css";

export default function Home() {

  const resources: SchedulerResource[] = [
    {
      name: 'UserType',
      data: [ { text: '1', value: 1, color: '#5392E4'}, 
        {text: '2', value: 2, color: '#FF7272'}
      ],
      field: 'ownerID', 
      valueField: 'value',
      textField: 'ownerID', 
      colorField: 'color'
    }
  ];


  return (
    <main>
      <AppHeader/>
     
      <section>
        <h2>My Calendar</h2>
         <Scheduler defaultView='month' resources={resources} data={sampleData} editable={{
                add: true,
                remove: true,
                drag: true,
                resize: true,
                select: true,
                edit: true
            }}>
                    <DayView />
                    <WeekView />
                    <WorkWeekView/>
                    <MonthView/>
                    <AgendaView/>
                </Scheduler>
      </section>
    </main>
  )
}
