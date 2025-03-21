import type {Collection, InsertManyResult, InsertOneResult} from "mongodb";
import type {CalendarEvent} from "./CalendarEventsObject";

export interface IPlanningBlocksService {
    input: {
        collection:  Collection<CalendarEvent>;
    },
    output: {
        eventSearch: (input: { queryParams: any }) => Promise<CalendarEvent[]>;
        getEventById: (input: { id: string }) => Promise<CalendarEvent | null>;
        postEvent: (input: { eventData: CalendarEvent | CalendarEvent[] }) => Promise<InsertManyResult<CalendarEvent> | InsertOneResult<CalendarEvent>>;
        [key: string]: any;
    };
}