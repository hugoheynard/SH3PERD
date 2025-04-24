import type {Plannings} from "./planningObjectBuilder";
import type {CalendarEventsObject} from "../../../planningBlocks/interfaces_events/CalendarEventsObject";
import {EventCollider} from "../../EventCollider";

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

    build(input: { plannings: Plannings[], events: CalendarEventsObject }): CollisionObject {
        const {plannings, events} = input;

        for (const planning of plannings) {
            const {staff_id} = planning;

            if (!planning.calendar_events) {
                continue;
            }

            if (plannings.indexOf(planning) !==1) { //test
                continue;
            }

            this.internalEventsMap.set(
                staff_id,
                planning.calendar_events.map((ev_id: string) => events[ev_id]));

            this.internalCollisionsMap.set(
                staff_id,
                new EventCollider({
                    eventsToCollide: this.internalEventsMap.get(staff_id)
                }).calculateCollisions()
            );

            const {eventCollisionList, checkedPairs} = this.internalCollisionsMap.get(staff_id);

            this.addResultToInternalCollisionObject({
                staff_id: staff_id,
                eventCollisionList: eventCollisionList
            });
            this.addProcessedPairsToProcessedPairSet({checkedPairs: checkedPairs});
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

    addResultToInternalCollisionObject(input: { staff_id: string; eventCollisionList: any }): void {
        const {staff_id, eventCollisionList} = input;

        this.internalCollisionsOutputObject[staff_id] = {
            crossEvent: [...eventCollisionList],
            maxCollisions: this.findMaxCollisions(eventCollisionList.map((collision: any) => collision.referenceEvent))
        };
    };

}