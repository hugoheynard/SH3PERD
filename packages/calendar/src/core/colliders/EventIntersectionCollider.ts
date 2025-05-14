import type {IEventCollider, TEventPairs, TEventUnitDomainModel, TEventUnitId, TUserId} from "@sh3pherd/shared-types";

type TEventIntersectionColliderContext = {
    target_id: TUserId;
    intersectsWith: TUserId[];
};

type TEventIntersectionResult = Map<TEventUnitId, TEventUnitDomainModel>

export class EventIntersectionCollider implements IEventCollider<TEventIntersectionColliderContext, TEventIntersectionResult>{
    private context: TEventIntersectionColliderContext = {} as TEventIntersectionColliderContext;
    private readonly eventsToCollide: TEventUnitDomainModel[];
    private readonly pairExclusionSet: Set<TEventPairs>;
    private checkedPairs: Set<TEventPairs>;

    constructor() {
        this.eventsToCollide = [];
        this.pairExclusionSet = new Set<TEventPairs>();
        this.checkedPairs = new Set<TEventPairs>();
    };

    /**
     * Calculates all collisions between planningBlocks.
     */
    execute() {
        try {
            // Safeguard: skip if context not provided
            if (!this.context?.target_id && !this.context?.intersectsWith?.length) {
                return;
            }

            this.validateInput({ events: this.eventsToCollide });
            this.insertPairExclusionSet();

            const events: TEventUnitDomainModel[] = this.eventsToCollide;
            const eventCollisionMap: Map<TEventUnitId, TEventUnitDomainModel> = new Map();

            for (let i: number = 0; i < events.length; i++) {
                for (let j: number = 0 ; j < events.length; j++) {
                    const refEvent = events[i];
                    const compEvent = events[j];

                    //avoid comparing the event with itself
                    if (refEvent.eventUnit_id === compEvent.eventUnit_id) {
                        continue;
                    }

                    const eventPairToCheck: TEventPairs = [refEvent.eventUnit_id, compEvent.eventUnit_id].sort().join('-') as TEventPairs;
                    if (this.checkIfPairHasBeenCompared(eventPairToCheck)) {
                        continue;
                    }

                    this.checkEventValidProperties({ events: [refEvent, compEvent] });

                    if (this.notCollide({ referenceEvent: refEvent, comparedEvent: compEvent })) {
                        continue;
                    }

                    const collidedEvent: TEventUnitDomainModel = this.createCollisionEvent({ referenceEvent: refEvent, comparedEvent: compEvent });
                    // Mark the pair as checked
                    this.checkedPairs.add(eventPairToCheck);
                    eventCollisionMap.set(collidedEvent.eventUnit_id, collidedEvent);
                }
            }
            return eventCollisionMap;

        } catch(err) {
            throw err;
        }
    };

    setContext(context: TEventIntersectionColliderContext): void {
        this.context = context?.eventIntersection ?? {};
    };

    addEvent(event: TEventUnitDomainModel): void {
        if (this.shouldIncludeEvent(event)) {
            this.eventsToCollide.push(event);
        }
    };

    private shouldIncludeEvent(event: TEventUnitDomainModel): boolean {
        const { target_id, intersectsWith } = this.context;
        return (
            (target_id && event.participants.includes(target_id)) ||
            (intersectsWith?.some(user => event.participants.includes(user)))
        );
    };

    /**
     * Checks if the event should be included for collision.
     * @param input The event to check.
     * @returns true if the event should be included, false otherwise.
     */
    notCollide(input: { referenceEvent: TEventUnitDomainModel, comparedEvent: TEventUnitDomainModel }): boolean {
        const {referenceEvent, comparedEvent} = input;

        const refStart: Date = referenceEvent.startDate;
        const refEnd: Date = referenceEvent.endDate;
        const compStart: Date = comparedEvent.startDate;
        const compEnd: Date = comparedEvent.endDate;


        return refEnd <= compStart || compEnd <= refStart;
    };

    /**
     * Creates a collision event based on the reference and compared events.
     * @param input The input containing the reference and compared events.
     * @returns The collision event with overlap timestamps
     */
    createCollisionEvent(input: { referenceEvent: TEventUnitDomainModel, comparedEvent: TEventUnitDomainModel }): TEventUnitDomainModel {
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
        };
    };

    /**
     * Validates that planningBlocks have the required fields.
     */
    validateInput(input: { events: TEventUnitDomainModel[]}): void {
        if (!Array.isArray(input.events)) {
            throw new Error('eventsToCollide must be an array');
        }
    };

    /**
     * Checks if the event has valid properties.
     * @param input The input containing the events to check.
     */
    checkEventValidProperties(input: { events: TEventUnitDomainModel[]}): void {
        input.events.forEach((event: TEventUnitDomainModel): void => {
            if (!event.eventUnit_id || !event.startDate || !event.endDate) {
                throw new Error(`Event with id ${event.eventUnit_id} is missing required fields (eventUnit_id, startDate, endDate)`);
            }
        });
    };

    /**
     * Inserts the pair exclusion set into checkedPairs.
     */
    insertPairExclusionSet(): void {
        this.checkedPairs = new Set<TEventPairs>([...this.pairExclusionSet, ...this.checkedPairs]);
    };

    /**
     * Checks if a pair of planningBlocks has already been compared.
     * @param pairKey The identifier for the pair of planningBlocks.
     * @returns true if the pair has been compared, false otherwise.
     */
    checkIfPairHasBeenCompared(pairKey: TEventPairs): boolean {
        if (!pairKey) {
            throw new Error("Invalid pairKey is required.");
        }

        return this.checkedPairs.has(pairKey);
    };
}