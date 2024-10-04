import {DateMethod} from "../../Utilities/class_DateMethods.js";
import {deepCopy} from "../../Utilities/deepCopy.js";
/**
 * Class representing an EventCollider that checks if two events collide based on their time steps.
 */
export class EventCollider {
    /**
     * private fields
     * */
    #referenceEvent;
    #comparedEvent;
    /**
     * Create an EventCollider.
     * @param {Object} input - The input object containing referenceEvent and comparedEvent.
     * @param {Object} input.referenceEvent - The event used as a reference for collision testing.
     * @param {Object} input.comparedEvent - The event to compare with the referenceEvent.
     * @throws Will throw an error if any event does not have a non-null date property.
     */
    constructor(input) {
        for (const value of Object.values(input)) {
            this.#checkDateProperty(value);
        }

        this.#referenceEvent = input.referenceEvent;
        this.#comparedEvent = input.comparedEvent;
        this.processCollisionTest();
    };

    /**
     * @returns {Object} The result of the collision test.
     */
    get result() {
        return this._result
    };

    /**
     * @returns {boolean} Whether the events collide.
     */
    get collide() {
        return this._collide;
    };

    /**
     * @returns {Array<Date>} The array of colliding steps (timestamps).
     */
    get collidingSteps() {
        return this._collidingSteps;
    };

    /**
     * Checks if the event has a non-null date property.
     * @private
     * @param {Object} event - The event object to check.
     * @throws Will throw an error if the event does not have a valid date property.
     */
    #checkDateProperty(event) {

        if (!event.hasOwnProperty('date') || !event.date) {
            throw new Error(`event must have a non null date property, ${event}`);
        }
        return event;
    };

    /**
     * Generates an array of time steps (timestamps) for the given event.
     * @param {Object} event - The event object.
     * @param {Date} event.date - The start date of the event.
     * @param {number} event.duration - The duration of the event in minutes.
     * @returns {Array<Date>} An array of time steps.
     */
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

    /**
     * Compares the time steps of two events and returns the colliding steps.
     * @param {Object} referenceEvent - The reference event object.
     * @param {Object} comparedEvent - The event to compare against the reference event.
     * @returns {Array<Date>} The array of colliding time steps.
     */

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

    /**
     * Processes the collision test by comparing the time steps of the reference event and the compared event.
     * Updates the `_collidingSteps`, `_collide`, and `_result` properties based on the collision test.
     * If a collision is detected, a `collisionEvent` object is added to the result.
     */
    processCollisionTest() {
        this._collidingSteps = this.getCollidingSteps(this.#referenceEvent, this.#comparedEvent);
        this._collide = this.collidingSteps.length > 0;

        this._result = {
            referenceEvent: this.#referenceEvent._id.toString(),
            comparedToEvent: this.#comparedEvent._id.toString(),
            collision_id: [this.#referenceEvent._id, this.#comparedEvent._id].sort().join('-'),
            collide: this.collide,
        }

        if (this.collide) {

            const collisionEvent = deepCopy(this.#comparedEvent);
            collisionEvent.date = this.collidingSteps[0];
            collisionEvent.duration = this.collidingSteps.length * DateMethod.STEP_DURATION;

            this.result.collisionEvent = collisionEvent;
        }

    };
}