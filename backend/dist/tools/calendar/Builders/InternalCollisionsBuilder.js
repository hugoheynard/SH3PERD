import { BatchEventColliderModule } from "../eventCollision/BatchEventCollider.ts";
export class InternalCollisionsBuilder {
    constructor() {
        this.internalEventsMap = new Map();
        this.internalCollisionsMap = new Map();
        this.processedPairs = new Set();
    }
    ;
    findMaxCollisions(eventRefArray) {
        const eventCountMap = new Map();
        for (const ref of eventRefArray) {
            eventCountMap.set(ref, (eventCountMap.get(ref) || 0) + 1);
        }
        return Math.max(...Array.from(eventCountMap.values()));
    }
    ;
    build({ plannings, events }) {
        const internalCollisions = {};
        for (const planning of plannings) {
            const { staff_id } = planning;
            internalCollisions[staff_id] = {};
            if (!planning.calendar_events) {
                continue;
            }
            this.internalEventsMap.set(staff_id, planning.calendar_events.map(ev_id => events[ev_id]));
            this.internalCollisionsMap.set(staff_id, new BatchEventColliderModule({ eventsToCollide: this.internalEventsMap.get(staff_id) }));
            const { positiveCollisionlist, checkedPairs } = this.internalCollisionsMap.get(staff_id);
            internalCollisions[staff_id] = {
                crossEvent: [...positiveCollisionlist],
                maxCollisions: this.findMaxCollisions(positiveCollisionlist.map(collision => collision.referenceEvent))
            };
            this.processedPairs = new Set([...this.processedPairs, ...checkedPairs]);
        }
        return internalCollisions;
    }
    ;
}
//# sourceMappingURL=InternalCollisionsBuilder.js.map