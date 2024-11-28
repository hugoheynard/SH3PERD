import {BatchEventColliderModule} from "../eventCollision/BatchEventCollider";
import type {Plannings} from "./planningObjectBuilder";
import type {EventBuilderOutput} from "./eventObjectBuilder";

export interface CollisionObject {
    [key: string]: {
        crossEvents: any[]
        maxCollisions: number;
    }
}

export class InternalCollisionsBuilder {
    private internalEventsMap: Map<string, any>;
    private internalCollisionsMap: Map<string, any>;
    private processedPairs: Set<string>;
    private internalCollisionsOutputObject: any = {};

    constructor() {
        this.internalEventsMap = new Map();
        this.internalCollisionsMap = new Map();
        this.processedPairs = new Set();
    };

    build(input: { plannings: Plannings[], events: EventBuilderOutput }): CollisionObject {
        const { plannings, events } = input;

        for (const planning of plannings) {
            const { staff_id } = planning;

            if (!planning.calendar_events) {
                continue;
            }

            this.internalEventsMap.set(staff_id, planning.calendar_events.map((ev_id: string) => events[ev_id]));
            this.internalCollisionsMap.set(staff_id, new BatchEventColliderModule({ eventsToCollide: this.internalEventsMap.get(staff_id)}));

            const { positiveCollisionList, checkedPairs } = this.internalCollisionsMap.get(staff_id);

            this.addResultToInternalCollisionObject({
                staff_id: staff_id,
                positiveCollisionList: positiveCollisionList
            });
            this.addProcessedPairsToProcessedPairSet({ checkedPairs: checkedPairs });
        }

        return this.internalCollisionsOutputObject;
    };

    findMaxCollisions(eventRefArray: string[]): number {
        const eventCountMap: Map<string, number> = new Map();

        for (const ref of eventRefArray) {
            eventCountMap.set(ref, (eventCountMap.get(ref) || 0) + 1);
        }

        return Math.max(...Array.from(eventCountMap.values()));
    };

    addProcessedPairsToProcessedPairSet(input: { checkedPairs: Set<string> }): void {
        this.processedPairs = new Set([...this.processedPairs, ...input.checkedPairs]);
    };

    addResultToInternalCollisionObject(input: { staff_id: string; positiveCollisionList: any}): void {
        const { staff_id, positiveCollisionList } = input;

        this.internalCollisionsOutputObject[staff_id] = {
            crossEvent: [...positiveCollisionList],
            maxCollisions: this.findMaxCollisions(positiveCollisionList.map((collision: any) => collision.referenceEvent))
        };
    };

}