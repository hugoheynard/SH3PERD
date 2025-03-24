import {buildEventQuery} from "../tools/events/EventQueryBuilder";
import {ObjectId} from "mongodb";
import type {CalendarEvent} from "./interfaces_events/CalendarEventsObject";
import type {IPlanningBlocksService} from "./interfaces_events/IPlanningBlocksService";
import {wrapServiceWithTryCatch} from "../services/tryCatchServiceWrapper";


export const planningBlocksService = (input: IPlanningBlocksService['input']) => {
    const { collection} = input;
    const queryBuilder = buildEventQuery;

    const service: IPlanningBlocksService['output'] = {
        /**
         * getEvents according to query
         * @param input
         * @returns {Promise<*>}
         */
        eventSearch: async (input) =>{
            try {
                return await collection.find(queryBuilder(input.queryParams)).toArray();
            } catch (err) {
                console.error("Error retrieving planningBlocks:", err);
                throw err;
            }
        },

        /**
         * Recherche un événement par son ID
         * @param input
         * @returns {Promise<CalendarEvent | null>}
         */
        getEventById: async (input)=>{
            try {
                return await collection.findOne({ _id: new ObjectId(input.id) });
            } catch (err) {
                console.error("Error retrieving planningBlocks:", err);
                throw err;
            }
        },

        /**
         * Crée un nouvel événement
         * @param input
         */
        postEvent: async (input) =>{
            try {
                if (Array.isArray(input.eventData)) {
                    return await collection.insertMany(input.eventData);
                }

                return await collection.insertOne(input.eventData);

            } catch(err) {
                console.error("Error inserting planningBlocks:", err);
                throw new Error("Could not insert planningBlocks");
            }
        }

    };

    return wrapServiceWithTryCatch(service);
}