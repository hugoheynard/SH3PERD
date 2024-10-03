import {DateMethod} from "../../Utilities/class_DateMethods.js";
import {deepCopy} from "../../Utilities/deepCopy.js";

export class EventColliderModule {
    constructor() {
        this.crossPlannings = [];
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

    getCrossSteps(event1, event2){
        const timeSteps1 = this.getTimeStepsArray(event1);
        const timeSteps2 = this.getTimeStepsArray(event2);

        const crossSteps = [];

        for (const ev1step of timeSteps1) {
            for (const ev2step of timeSteps2) {
                if (ev1step.getTime() === ev2step.getTime()) {
                    crossSteps.push(ev1step);
                }
            }
        }
        return crossSteps;
    };
    blockCollide(array) {
        return array.length > 0;
    };

    getCollidingEvents(baseEvent, eventsToCompare) {
        return eventsToCompare.filter(otherEvent => this.blockCollide(this.getCrossSteps(baseEvent, otherEvent)));
    };

    getCollisionList(eventList) {
        const collisionObject = {};
        for (const event of eventList) {
            const eventsToCompare = eventList.filter(elem => elem !== event);
            collisionObject[event._id] = this.getCollidingEvents(event, eventsToCompare).map(event => event._id);
        }
        return collisionObject;
    };

    findCollisionList(data) {
        //here we split collisions in two type: per planning collision and partner cross planning
        this.buildPlanningCollisionList(data);
        this.buildPartnerCrossEvents(data);
    };

    buildPlanningCollisionList(data) {
        for (const planning of data.plannings) {
            const planningEventList = planning.calendar_events.map(event => data.events[event]);
            planning.collisionList = this.getCollisionList(planningEventList);
        }
    };

//CROSS PLANNING
    buildPartnerCrossEvents(data) {
        //on commence par traiter tous les créneaux horaires actifs?
        const planning = data.plannings[0]
        const planningEventList = planning.calendar_events.map(event => data.events[event]);

        //on trie sur ceux qui ont la même location
        this.splitSharedAndCrossedEvents(data, planningEventList)
    }
    splitSharedAndCrossedEvents(data, eventList) {
        const dataCopy = deepCopy(data);

        const splitObject = {
            dataCopy: {...dataCopy},
            sharedWithPlanningOwner: {},
            crossEvents: {}
        };

        for (const event of eventList) {
            //getSharedWithPlanningOwner_Events -> events that includes many participants will be full duration cross events - no need for calculations

            if (event.participants.length > 1) { //
                splitObject.sharedWithPlanningOwner[event._id] = event;
                delete splitObject.dataCopy.events[event._id];
            } else {
                const remainingEvents = Object.values(splitObject.dataCopy.events);

                for (const otherEvent of remainingEvents) {
                    //const collisionArray = this.blockCollide(event, otherEvent);
                    /*
                    if (collisionArray) {

                        const generatedCrossEvent = {
                            date: new Date(collisionArray[0]),
                            duration: collisionArray.length * DateMethod.STEP_DURATION,
                            participants: otherEvent.participants
                        }
                        console.log(generatedCrossEvent)

                         */
                    }
                }
            }




    }

        //console.log(splitObject)

}