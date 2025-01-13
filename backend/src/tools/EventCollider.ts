import type {CalendarEvent} from "../interfaces/CalendarEventsObject";

export interface CollisionReport{
    referenceEvent_id: string;
    comparedEvent_id: string;
    collision_id: string;
    collide: boolean;
    collisionEvent?: CollisionEvent;
}

export interface CollisionEvent extends CalendarEvent {
    duration: number;
}

export interface BatchEventColliderInput {
    eventsToCollide: CalendarEvent[];
    pairExclusionSet?: Set<string>;
}


export class EventCollider {
    private readonly debug: boolean;
    private readonly eventsToCollide: CalendarEvent[];
    pairExclusionSet: Set<string>;
    checkedPairs: Set<string>;
    eventCollisionList: CollisionReport[];

    constructor(input: BatchEventColliderInput, debug: boolean = false) { //TODO pas sur de virer le debug
        this.debug = debug;
        this.eventsToCollide = input.eventsToCollide;
        this.pairExclusionSet = input.pairExclusionSet || new Set<string>();
        this.checkedPairs = new Set<string>();
        this.eventCollisionList = [];

        this.calculateCollisions();
    };

    /**
     * Calculates all collisions between events.
     */
    calculateCollisions(): { checkedPairs: Set<string>; eventCollisionList: CollisionReport[]; } {
        try {
            this.validateInput({ events: this.eventsToCollide });
            this.resetCacheProperties();
            this.insertPairExclusionSet();

            const events: CalendarEvent[] = this.eventsToCollide;

            for (let i: number = 0; i < events.length; i++) {
                for (let j: number = 0 ; j < events.length; j++) {
                    const refEvent: CalendarEvent = events[i];
                    const compEvent: CalendarEvent = events[j];

                    if (refEvent._id === compEvent._id) continue;

                    const eventPairToCheck: string = [refEvent._id, compEvent._id].sort().join('-');
                    if (this.checkIfPairHasBeenCompared({ pair_id: eventPairToCheck })) continue;

                    this.checkEventValidProperties({ events: [refEvent, compEvent] });

                    const collisionReport: CollisionReport = this.collide({ referenceEvent: refEvent, comparedEvent: compEvent });

                    if (collisionReport.collide) {
                        const collisionEvent: CollisionEvent = this.createCollisionEvent({ referenceEvent: refEvent, comparedEvent: compEvent });

                        this.eventCollisionList.push({
                            ...collisionReport,
                            collisionEvent
                        });
                        continue;
                    }
                    this.eventCollisionList.push(collisionReport);
                }
            }
            return {
                eventCollisionList: this.eventCollisionList,
                checkedPairs: this.checkedPairs
            };
        } catch(err) {
            throw err;
        }
    };

    collide(input: { referenceEvent: CalendarEvent, comparedEvent: CalendarEvent }): CollisionReport {
        const {referenceEvent, comparedEvent} = input;

        const refStart: Date = referenceEvent.startDate;
        const refEnd: Date = referenceEvent.endDate;
        const compStart: Date = comparedEvent.startDate;
        const compEnd: Date = comparedEvent.endDate;

        const collide: boolean = (refStart < compEnd) && (compStart < refEnd);

        return {
            referenceEvent_id: referenceEvent._id.toString(),
            comparedEvent_id: comparedEvent._id.toString(),
            collision_id: [referenceEvent._id, comparedEvent._id].sort().join('-'),
            collide,
        };
    };

    createCollisionEvent(input: { referenceEvent: CalendarEvent, comparedEvent: CalendarEvent }): CollisionEvent {
        const {referenceEvent, comparedEvent} = input;

        const refStart: Date = referenceEvent.startDate;
        const refEnd: Date = referenceEvent.endDate;
        const compStart: Date = comparedEvent.startDate;
        const compEnd: Date = comparedEvent.endDate;

        const collisionStart: Date = refStart > compStart ? refStart : compStart;
        const collisionEnd: Date = refEnd < compEnd ? refEnd : compEnd;
        const collisionDuration: number = (collisionEnd.getTime() - collisionStart.getTime()) / (60 * 1000);

        const { startDate, endDate, ...comparedEventRest } = comparedEvent;


        return {
            ...comparedEventRest,
            startDate: collisionStart,
            endDate: collisionEnd,
            duration: collisionDuration
        };
    };

    /**
     * Validates that events have the required fields.
     */
    validateInput(input: { events: CalendarEvent[]}): void {
        if (!Array.isArray(input.events)) {
            throw new Error('eventsToCollide must be an array');
        }
    };

    checkEventValidProperties(input: { events: CalendarEvent[]}): void {
        input.events.forEach((event: CalendarEvent): void => {
            if (!event._id || !event.startDate || !event.endDate) {
                this.log(`Event with id ${event._id} is missing required fields (startDate, endDate)`);
                throw new Error(`Event with id ${event._id} is missing required fields (startDate, endDate)`);
            }
        });
    };

    /**
     * Inserts the pair exclusion set into checkedPairs.
     */
    insertPairExclusionSet(): void {
        this.checkedPairs = new Set<string>([...this.pairExclusionSet, ...this.checkedPairs]);
    };

    /**
     * Logs messages only if debugging is enabled.
     */
    log(message: string): void {
        if (this.debug) {
            console.log(message);
        }
    };

    /**
     * Checks if a pair of events has already been compared.
     * @param input The identifier for the pair of events.
     * @returns true if the pair has been compared, false otherwise.
     */
    checkIfPairHasBeenCompared(input: { pair_id: string }): boolean {
        const {pair_id} = input;

        if (!input || !pair_id) {
            throw new Error("Invalid input: pair_id is required.");
        }

        if (this.checkedPairs.has(pair_id)) {
            return true;
        }

        this.checkedPairs.add(pair_id); // Mark the pair as checked
        return false;
    };

    resetCacheProperties(): void {
        this.eventCollisionList.length = 0;
        this.checkedPairs = new Set<string>();
    };
}
