import {buildEventQuery} from "../tools/events/EventQueryBuilder";
import {ObjectId} from "mongodb";

export const eventService = (input: any): any => {
    const collection = input.collection;
    const queryBuilder = buildEventQuery;


    return {
        /**
         * getEvents according to query
         * @param queryParams
         * @returns {Promise<*>}
         */
        async eventSearch(queryParams: any): Promise<any> {
            try {
                return await collection.find(queryBuilder(queryParams)).toArray();
            } catch (err) {
                console.error("Error retrieving events:", err);
                throw err;
            }
        },

        async getEventById(input: { id: string }): Promise<any> {
            try {
                return await collection.findOne({ _id: new ObjectId(input.id) });
            } catch (err) {
                console.error("Error retrieving events:", err);
                throw err;
            }
        },



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