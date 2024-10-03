import {EventCollider} from "../functionnalities/class_EventCollider.js";
import {findEarliestEventInArray} from "../../Utilities/sortBlockArray.js";
/* The idea is to have an efficient algorithm to calculate events collision between each staff
* -> to determine interactions per event
* -> without calculating the same combination more than once
* -> these crossStaff_collisionEvents will be used to insert interaction data such as :
*   -> combinations of tracks for club sessions
*   -> list of pbo shows
*   -> etc...
* */
export class StaffCrossEventsModule{
    constructor() {
        /**
         * List to store the results of event collisions.
         * @type {Array<Object>}
         */
        this.list = [];
    };
    sortList_DenseActivityPeriodFirst(input) {
        //TODO ici
        const data = input.data;
        const split = new Date(findEarliestEventInArray(data).date)

        if (input.direction === 'earliestToLatest') {
            data.sort((a, b) => a.date - b.date);
        }

    };

    calculate(data) {
        this.list.length = 0;
        //todo changer la deep copy pour être une instance de date
        const events = Object.values(data.events)

        //this.sortList_DenseActivityPeriodFirst({data: events, split: '12:00', direction: 'splitToEnd', merge: 'reverse'})

        const checkedPairs = new Set();

        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {
                const referenceEvent = events[i];
                const comparedEvents = events[j];

                const eventPair = [referenceEvent._id, comparedEvents._id].sort().join('-');

                if (checkedPairs.has(eventPair)) {
                    continue;
                }
                checkedPairs.add(eventPair);

                const collider = new EventCollider({
                    referenceEvent: referenceEvent,
                    comparedEvent: comparedEvents
                });

                if (collider.collide) {
                    this.list.push(collider.result);
                }
            }
        }
        return this.list;
    };

}