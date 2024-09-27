import {DateMethod} from "../../Utilities/class_DateMethods.js";

export class EventCollider {
    constructor() {
        this.collisionList = [];
    };

    getTimeStepsArray(event){
        if (!event.hasOwnProperty('date') || !event.date) {
            throw new Error('event must have a non null date property');
        }

        const startDate = event.date;
        const endDate = DateMethod.addMinutes(startDate, event.duration);

        const stepArray = [];

        let timeStep = startDate;
        while (timeStep < endDate) {
            stepArray.push(new Date(timeStep));
            timeStep = DateMethod.addMinutes(timeStep, DateMethod.STEP_DURATION);
        }

        return stepArray;
    };

    blockCollide(event1, event2){
        const timeSteps1 = this.getTimeStepsArray(event1);
        const timeSteps2 = this.getTimeStepsArray(event2);

        return timeSteps1.some(elem1 =>
            timeSteps2.some(elem2 => elem1.getTime() === elem2.getTime())
        );
    };

    getEventsFromEventID(data) { //TODO
        return data.planning.calendar_events.map(key => data.events[key]);
    };

    getCollidingEvents(baseEvent, eventsToCompare) {
        return eventsToCompare.filter(otherEvent => this.blockCollide(baseEvent, otherEvent))
    };

    findCollisionList(data) {
        const eventList = Object.values(data.events);

        for (const event of eventList) {
            const eventsToCompare = eventList.filter(elem => elem !== event);
            event.collisionList = this.getCollidingEvents(event, eventsToCompare).map(event => event._id.toString());
        }
    };
}