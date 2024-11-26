import { EventCollider } from "./EventCollider";
import { IntervalTree } from "./IntervalTree";

export class BatchEventColliderModule {
    private eventsToCollide: any;
    private pairExclusionSet: Set<string>;
    private checkedPairs: Set<string>;
    private positiveCollisionList: any[];
    private debug: boolean;

    constructor(input: any, debug: boolean = false) {
        this.debug = debug;
        this.eventsToCollide = input.eventsToCollide;
        this.pairExclusionSet = input.pairExclusionSet || new Set();
        this.checkedPairs = new Set();
        this.insertPairExclusionSet();
        this.positiveCollisionList = [];
        this.validateEvents();
        this.calculateCollisions();
    }

    /**
     * Validates that events have the required fields.
     */
    validateEvents(): void {
        if (!Array.isArray(this.eventsToCollide)) {
            throw new Error('eventsToCollide must be an array');
        }

        this.eventsToCollide.forEach(event => {
            if (!event._id || !event.startDate || !event.endDate) {
                this.log(`Event with id ${event._id} is missing required fields (startDate, endDate)`);
                throw new Error(`Event with id ${event._id} is missing required fields (startDate, endDate)`);
            }
        });
    }

    /**
     * Inserts the pair exclusion set into checkedPairs.
     */
    insertPairExclusionSet(): void {
        this.pairExclusionSet.forEach(pair => {
            this.checkedPairs.add(pair);
        });
    }

    /**
     * Logs messages only if debugging is enabled.
     */
    log(message: string): void {
        if (this.debug) {
            console.log(message);
        }
    }

    /**
     * Calculates all collisions between events.
     */
    calculateCollisions(): void {
        this.positiveCollisionList.length = 0; // Reset collision list

        const intervals = this.eventsToCollide.map(event => ({
            id: event._id,
            start: new Date(event.startDate).getTime(),
            end: new Date(event.endDate).getTime(),
            event
        }));

        const intervalTree: any = new IntervalTree(intervals);

        // Function to check collisions for each event
        const checkCollisionsForInterval = (interval): void => {
            const overlappingIntervals = intervalTree.queryOverlap({ start: interval.start, end: interval.end });
            const collisions: any[] = [];

            for (const overlap of overlappingIntervals) {
                if (interval.id === overlap.id) continue;

                const eventPairToCheck = [interval.id, overlap.id].sort().join('-');
                if (this.checkIfPairHasBeenCompared(eventPairToCheck)) {
                    continue;
                }

                const collisionElement = EventCollider.createCollisionElement(interval.event, overlap.event);
                if (collisionElement.collide) {
                    this.positiveCollisionList.push(collisionElement);
                }
            }
        };

        // Loop through all intervals and check for collisions
        intervals.forEach(interval => {
            checkCollisionsForInterval(interval);
        });
    }

    /**
     * Checks if a pair of events has already been compared.
     * @param pair The identifier for the pair of events.
     * @returns true if the pair has been compared, false otherwise.
     */
    checkIfPairHasBeenCompared(pair: string): boolean {
        if (this.checkedPairs.has(pair)) {
            return true;
        }
        this.checkedPairs.add(pair); // Mark the pair as checked
        return false;
    }
}
