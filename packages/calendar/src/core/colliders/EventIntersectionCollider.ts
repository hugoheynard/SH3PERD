import type {TEventPairs, TEventUnitDomainModel} from "@sh3pherd/shared-types";


export class EventIntersectionCollider {
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
    execute(): TEventUnitDomainModel[] {
        try {
            this.validateInput({ events: this.eventsToCollide });
            this.insertPairExclusionSet();

            const events: TEventUnitDomainModel[] = this.eventsToCollide;
            const eventCollisionList: TEventUnitDomainModel[] = [];

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

                    eventCollisionList.push(this.createCollisionEvent({ referenceEvent: refEvent, comparedEvent: compEvent }));
                    // Mark the pair as checked
                    this.checkedPairs.add(eventPairToCheck);
                }
            }
            return eventCollisionList;
        } catch(err) {
            throw err;
        }
    };

    notCollide(input: { referenceEvent: TEventUnitDomainModel, comparedEvent: TEventUnitDomainModel }): boolean {
        const {referenceEvent, comparedEvent} = input;

        const refStart: Date = referenceEvent.startDate;
        const refEnd: Date = referenceEvent.endDate;
        const compStart: Date = comparedEvent.startDate;
        const compEnd: Date = comparedEvent.endDate;


        return refEnd <= compStart || compEnd <= refStart;
    };

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

    checkEventValidProperties(input: { events: TEventUnitDomainModel[]}): void {
        input.events.forEach((event: TEventUnitDomainModel): void => {
            if (!event.eventUnit_id || !event.startDate || !event.endDate) {
                throw new Error(`Event with id ${event.eventUnit_id} is missing required fields (startDate, endDate)`);
            }
        });
    };

    addEvent(event: TEventUnitDomainModel): void {
        this.eventsToCollide.push(event);
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
