import { EventCollider } from "./EventCollider.js";
import { IntervalTree } from "./IntervalTree.js";
export class BatchEventColliderModule {
    eventsToCollide;
    pairExclusionSet;
    checkedPairs;
    positiveCollisionList;
    debug;
    constructor(input, debug = false) {
        this.debug = debug;
        this.eventsToCollide = input.eventsToCollide;
        this.pairExclusionSet = input.pairExclusionSet || new Set();
        this.checkedPairs = new Set();
        this.insertPairExclusionSet();
        this.positiveCollisionList = [];
        this.calculateCollisions();
    }
    ;
    /**
     * Calculates all collisions between events.
     */
    calculateCollisions() {
        try {
            this.validateEvents({ events: this.eventsToCollide });
            this.positiveCollisionList.length = 0; // Reset collision list
            const intervals = this.transformEventsInIntervals({ events: this.eventsToCollide });
            const intervalTree = new IntervalTree(intervals);
            // Function to check collisions for each event
            const checkCollisionsForInterval = (interval) => {
                const overlappingIntervals = intervalTree.queryOverlap({ start: interval.start, end: interval.end });
                for (const overlap of overlappingIntervals) {
                    if (interval.id === overlap.id)
                        continue;
                    const eventPairToCheck = [interval.id, overlap.id].sort().join('-');
                    if (this.checkIfPairHasBeenCompared({ pair_id: eventPairToCheck })) {
                        continue;
                    }
                    const collisionElement = EventCollider.createCollisionElement(interval.event, overlap.event);
                    if (collisionElement.collide) {
                        this.positiveCollisionList.push(collisionElement);
                    }
                }
            };
            // Loop through all intervals and check for collisions
            intervals.forEach((interval) => {
                checkCollisionsForInterval(interval);
            });
        }
        catch (e) {
            throw e;
        }
    }
    transformEventsInIntervals(input) {
        return input.events.map((event) => ({
            id: event._id.toString(),
            start: new Date(event.startDate).getTime(),
            end: new Date(event.endDate).getTime(),
            event
        }));
    }
    ;
    /**
     * Validates that events have the required fields.
     */
    validateEvents(input) {
        const { events } = input;
        if (!Array.isArray(events)) {
            throw new Error('eventsToCollide must be an array');
        }
        events.forEach((event) => {
            if (!event._id || !event.startDate || !event.endDate) {
                this.log(`Event with id ${event._id} is missing required fields (startDate, endDate)`);
                throw new Error(`Event with id ${event._id} is missing required fields (startDate, endDate)`);
            }
        });
    }
    /**
     * Inserts the pair exclusion set into checkedPairs.
     */
    insertPairExclusionSet() {
        this.pairExclusionSet.forEach((pair) => {
            this.checkedPairs.add(pair);
        });
    }
    ;
    /**
     * Logs messages only if debugging is enabled.
     */
    log(message) {
        if (this.debug) {
            console.log(message);
        }
    }
    ;
    /**
     * Checks if a pair of events has already been compared.
     * @param input The identifier for the pair of events.
     * @returns true if the pair has been compared, false otherwise.
     */
    checkIfPairHasBeenCompared(input) {
        if (!input || !input.pair_id) {
            throw new Error("Invalid input: pair_id is required.");
        }
        if (this.checkedPairs.has(input.pair_id)) {
            return true; // Pair already compared
        }
        this.checkedPairs.add(input.pair_id); // Mark the pair as checked
        return false;
    }
    ;
}
//# sourceMappingURL=BatchEventCollider.js.map