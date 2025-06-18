const baseData = [
    {
        TaskID: 4,
        OwnerID: 1,
        Title: 'Appointment for Matt Smith',
        Description: '',
        StartTimezone: null,
        Start: '2013-06-09T21:00:00.000Z',
        End: '2013-06-10T00:00:00.000Z',
        EndTimezone: null,
        RecurrenceRule: null,
        RecurrenceID: null,
        RecurrenceException: null,
        isAllDay: false
    },
    {
        TaskID: 5,
        OwnerID: 1,
        Title: 'Appointment for Tom Baker',
        Description: '',
        StartTimezone: null,
        Start: '2013-06-10T07:00:00.000Z',
        End: '2013-06-10T08:00:00.000Z',
        EndTimezone: null,
        RecurrenceRule: null,
        RecurrenceID: null,
        RecurrenceException: null,
        isAllDay: false
    },
    {
        TaskID: 6,
        OwnerID: 2,
        Title: 'Appointment for Billie Piper',
        Description: '',
        StartTimezone: null,
        Start: '2013-06-11T11:30:00.000Z',
        End: '2013-06-11T13:00:00.000Z',
        EndTimezone: null,
        RecurrenceRule: null,
        RecurrenceID: null,
        RecurrenceException: null,
        isAllDay: false
    },
   
];

export const customModelFields = {
    id: 'TaskID',
    title: 'Title',
    description: 'Description',
    start: 'Start',
    end: 'End',
    recurrenceRule: 'RecurrenceRule',
    recurrenceId: 'RecurrenceID',
    recurrenceExceptions: 'RecurrenceException'
};

const currentYear = new Date().getFullYear();
const parseAdjust = (eventDate) => {
    const date = new Date(eventDate);
    date.setFullYear(currentYear);
    return date;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const displayDate = new Date(Date.UTC(currentYear, 5, 24));

export const sampleData = baseData.map((dataItem) => ({
    id: dataItem.TaskID,
    start: parseAdjust(dataItem.Start),
    startTimezone: dataItem.StartTimezone,
    end: parseAdjust(dataItem.End),
    endTimezone: dataItem.EndTimezone,
    isAllDay: dataItem.isAllDay,
    title: dataItem.Title,
    description: dataItem.Description,
    recurrenceRule: dataItem.RecurrenceRule,
    recurrenceId: dataItem.RecurrenceID,
    recurrenceExceptions: dataItem.RecurrenceException,

    roomId: dataItem.RoomID,
    ownerID: dataItem.OwnerID,
    personId: dataItem.OwnerID
}));

export const sampleDataWithResources = baseData.map((dataItem) => ({
    id: dataItem.TaskID,
    start: parseAdjust(dataItem.Start),
    startTimezone: dataItem.StartTimezone,
    end: parseAdjust(dataItem.End),
    endTimezone: dataItem.EndTimezone,
    isAllDay: dataItem.isAllDay,
    title: dataItem.Title,
    description: dataItem.Description,
    recurrenceRule: dataItem.RecurrenceRule,
    recurrenceId: dataItem.RecurrenceID,
    recurrenceExceptions: dataItem.RecurrenceException,
    roomId: randomInt(1, 2),
    personId: randomInt(1, 2)
}));

export const sampleDataWithCustomSchema = baseData.map((dataItem) => ({
    ...dataItem,
    Start: parseAdjust(dataItem.Start),
    End: parseAdjust(dataItem.End),
    PersonIDs: randomInt(1, 2),
    RoomID: randomInt(1, 2)
}));
