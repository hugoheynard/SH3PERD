export class EventService {
    constructor(input) {
        this.eventCollection = input.collection;
        this.tools = input.tools;
    };

    /**
     * getEvents according to query
     * @param query
     * @returns {Promise<*>}
     */
    async getEvents(query) {
        try {
            return await this.eventCollection.find(query).toArray();
        }catch (err) {
            console.error("Error retrieving calendar events:", err);
            throw err;
        }
    };


    async postEvent(eventData) {
        const dateBuilder = input => {
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

        return await this.eventCollection.insertOne(preparedData);
    };

}