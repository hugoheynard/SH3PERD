import {buildEventQuery} from "../tools/events/EventQueryBuilder";
import {type Collection, type InsertManyResult, type InsertOneResult, ObjectId} from "mongodb";
import type {CalendarEvent} from "../interfaces/CalendarEventsObject";

export interface EventService{
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

export const eventService = (input: EventService['input']): EventService['output'] => {
    const { collection} = input;
    const queryBuilder = buildEventQuery;


    return {
        /**
         * getEvents according to query
         * @param input
         * @returns {Promise<*>}
         */
        async eventSearch(input) {
            try {
                return await collection.find(queryBuilder(input.queryParams)).toArray();
            } catch (err) {
                console.error("Error retrieving events:", err);
                throw err;
            }
        },

        /**
         * Recherche un événement par son ID
         * @param input
         * @returns {Promise<CalendarEvent | null>}
         */
        async getEventById(input){
            try {
                return await collection.findOne({ _id: new ObjectId(input.id) });
            } catch (err) {
                console.error("Error retrieving events:", err);
                throw err;
            }
        },

        /**
         * Crée un nouvel événement
         * @param input
         */
        async postEvent(input) {
            try {
                if (Array.isArray(input.eventData)) {
                    return await collection.insertMany(input.eventData);
                }

                return await collection.insertOne(input.eventData);

            } catch(err) {
                console.error("Error inserting events:", err);
                throw new Error("Could not insert events");
            }
        }
    };
}