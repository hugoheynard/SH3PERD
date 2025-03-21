import type {ObjectId, WithId} from "mongodb";

export interface CalendarEvent {
    _id: ObjectId | string;
    startDate: Date;
    endDate: Date;
    type: string;
    participants: string[];
    generated: boolean;
    [key: string]: any;
}

export interface CalendarEventsObject {
    [key: string]: CalendarEvent;
}

export type CalendarEventDocument = WithId<CalendarEvent>;