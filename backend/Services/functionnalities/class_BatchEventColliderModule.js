import {EventCollider} from "./class_EventCollider.js";
import {findEarliestEventInArray} from "../../Utilities/sortBlockArray.js";


export class BatchEventColliderModule{
    /**
    * The `BatchEventColliderModule` class efficiently calculates event collisions between staff members.
    * The collisions are determined to track interactions per event, ensuring that no combination is calculated more than once.
     * List to store the results of event collisions.
     * @type {Array<Object>}
     */

    constructor(input) {
        this.eventsToCollide = input.eventsToCollide;
        this.pairExclusionSet = input.pairExclusionSet;

        this.checkedPairs = new Set();
        this.insertPairExclusionSet();

        this.positiveCollisionlist = [];
        this.calculateCollisions();
    };
    sortList_DenseActivityPeriodFirst(input) {
        //TODO extract pre triage logic
        const data = input.data;
        const split = new Date(findEarliestEventInArray(data).date)

        if (input.direction === 'earliestToLatest') {
            data.sort((a, b) => a.date - b.date);
        }

    };

    /**
     * Calculates collisions between all pairs of events in the `eventsToCollide` array.
     * It ensures that no pair is checked more than once by using the `checkedPairs` set.
     * If two events collide, they are added to the list of results.
     * @returns {Array<Object>} The list of collision results.
     */
    insertPairExclusionSet() {
        if (this.pairExclusionSet) {
            this.checkedPairs = new Set(this.pairExclusionSet);
        }
    };
    calculateCollisions2() {
        this.positiveCollisionlist.length = 0;
        const events = this.eventsToCollide;

        //this.sortList_DenseActivityPeriodFirst({data: events, split: '12:00', direction: 'splitToEnd', merge: 'reverse'})

        for (let i = 0; i < events.length; i++) {
            const collisionMap = new Map();

            for (let j = i + 1; j < events.length; j++) {
                const referenceEvent = events[i];
                const comparedEvents = events[j];

                const eventPairToCheck = [referenceEvent._id, comparedEvents._id].sort().join('-');

                if (this.checkIfPairHasBeenCompared(eventPairToCheck)) {
                    continue;
                }

                const collider = new EventCollider({
                    referenceEvent: referenceEvent,
                    comparedEvent: comparedEvents
                })

                if (collider.collide) {
                    collisionMap.set(comparedEvents._id, collider)
                }
            }
        }
        return this.positiveCollisionlist;
    };

    calculateCollisions() {
        this.positiveCollisionlist.length = 0;
        const events = this.eventsToCollide;

        //this.sortList_DenseActivityPeriodFirst({data: events, split: '12:00', direction: 'splitToEnd', merge: 'reverse'})

        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {
                const referenceEvent = events[i];
                const comparedEvents = events[j];

                const eventPairToCheck = [referenceEvent._id, comparedEvents._id].sort().join('-');

                if (this.checkIfPairHasBeenCompared(eventPairToCheck)) {
                    continue;
                }



                this.addColliderToListIfCollide(
                    new EventCollider({
                        referenceEvent: referenceEvent,
                        comparedEvent: comparedEvents
                    })
                );
            }
        }
        return this.positiveCollisionlist;
    };
    /**
     * Check if a pair has been compared, if not, add it to the set.
     * @param {string} pair - The unique identifier for the event pair.
     * @returns {boolean} True if the pair has already been compared, false otherwise.
     */
    checkIfPairHasBeenCompared(pair) {
        if (this.checkedPairs.has(pair)) {
            return true; // Pair has already been compared
        }
        this.checkedPairs.add(pair); // Mark pair as compared
        return false; // Pair was not compared before
    };

    /**
     * Adds the result of an event collision to the list if the events actually collide.
     * @param {EventCollider} collider - The EventCollider instance.
     */
    addColliderToListIfCollide(collider){
        if (collider.collide) {
            this.positiveCollisionlist.push(collider.result);
        }
    };
}