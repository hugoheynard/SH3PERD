import {buildEventQuery} from "../tools/events/EventQueryBuilder";
import {type Collection, ObjectId} from "mongodb";
import type {CalendarEvent, CalendarEventDocument} from "../interfaces/CalendarEvents_interface";

export const eventService = (input: { collection: Collection<CalendarEvent> }): any => {
    const { collection} = input;
    const queryBuilder = buildEventQuery;


    return {
        /**
         * getEvents according to query
         * @param queryParams
         * @returns {Promise<*>}
         */
        async eventSearch(queryParams: any): Promise<CalendarEvent[]> {
            try {
                return await collection.find(queryBuilder(queryParams)).toArray();
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
        async getEventById(input: { id: string }): Promise<CalendarEvent | null> {
            try {
                return await collection.findOne({ _id: new ObjectId(input.id) });
            } catch (err: any) {
                console.error("Error retrieving events:", err);
                throw err;
            }
        },

        /**
         * Crée un nouvel événement
         * @param eventData
         * @returns {Promise<any>}
         */
        async postEvent(eventData: any): Promise<any> {
            const dateBuilder = (input: any) => {
                const date = new Date(input.date);
                const timeArray = input.time.split(':');
                date.setHours(timeArray[0]);
                date.setMinutes(timeArray[1]);
                return date
            }

            const preparedData = {
                date: dateBuilder({
                    date: eventData.date,
                    time: eventData.time
                }),
                duration: Number(eventData.duration),
                type: 'rehearsal'
            }

            return await collection.insertOne(preparedData);
        }
    };
}