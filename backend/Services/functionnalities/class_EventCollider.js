import {DateMethod} from "../../Utilities/class_DateMethods.js";


export class EventCollider {
    #referenceEvent;
    #comparedEvent;
    constructor(input) {

        for (const value of Object.values(input)) {
            this.#checkDateProperty(value);
        }

        this.#referenceEvent = input.referenceEvent;
        this.#comparedEvent = input.comparedEvent;
        this.processCollisionTest();
    };

    get result() {
        return this._result
    };

    get collide() {
        return this._collide;
    };

    get collidingSteps() {
        return this._collidingSteps;
    };

    #checkDateProperty(event) {

        if (!event.hasOwnProperty('date') || !event.date) {
            throw new Error(`event must have a non null date property, ${event}`);
        }
        return event;
    };

    getTimeStepsArray(event){
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

    getCollidingSteps(referenceEvent, comparedEvent){
        const referenceEvent_timeSteps = this.getTimeStepsArray(referenceEvent);
        const comparedEvent_timeSteps = this.getTimeStepsArray(comparedEvent);

        const comparedEvent_timeSet = new Set(comparedEvent_timeSteps.map(ev => ev.getTime()));
        const crossSteps = [];

        for (const refEvStep of referenceEvent_timeSteps) {
            if (comparedEvent_timeSet.has(refEvStep.getTime())) {
                crossSteps.push(refEvStep);
            }
        }
        return crossSteps;
    };

    processCollisionTest() {
        this._collidingSteps = this.getCollidingSteps(this.#referenceEvent, this.#comparedEvent);
        this._collide = this.collidingSteps.length > 0;

        this._result = {
            referenceEvent: this.#referenceEvent._id.toString(),
            comparedToEvent: this.#comparedEvent._id.toString(),
            collide: this.collide,
        }

        if (this.collide) {
            this.result.collisionEvent = {
                date: this.collidingSteps[0],
                duration: this.collidingSteps.length * DateMethod.STEP_DURATION
            }
        }

    };
}