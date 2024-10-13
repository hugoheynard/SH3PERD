import {BatchEventColliderModule} from "../functionnalities/class_BatchEventColliderModule.js";

export class PlanningCollisionManager {
    constructor(){
        this.internalEventsMap = new Map();
        this.internalCollisionsMap = new Map();
        this.processedPairs = new Set();
    };
    execute(data) {
        this.data = data;
        this.manageCollisions();
    };

    findMaxCollisions(eventRefArray) {
        const eventCountMap = new Map();

        for (const ref of eventRefArray) {
            eventCountMap.set(ref, (eventCountMap.get(ref) || 0) + 1);
        }

        return Math.max(...Array.from(eventCountMap.values()));
    };

    addCollisionPropertiesInObject(planning) {
        planning.collisions =  {
            internal: {},
            external: {}
        };
    };

    manageCollisions() {
        const { plannings } = this.data;

        //internal Collisions
        for (const planning of plannings) {
            const { staff_id } = planning;

            this.addCollisionPropertiesInObject(planning);

            if (!planning.calendar_events) {
                continue;
            }

            this.internalEventsMap.set(staff_id, planning.calendar_events.map(event => this.data.events[event]));
            this.internalCollisionsMap.set(staff_id, new BatchEventColliderModule({eventsToCollide: this.internalEventsMap.get(staff_id)}));

            const { positiveCollisionlist, checkedPairs} = this.internalCollisionsMap.get(staff_id);

            planning.collisions.internal = {
                crossEvent: [...positiveCollisionlist],
                maxCollisions: this.findMaxCollisions(positiveCollisionlist.map(collision => collision.referenceEvent))
            };
            this.processedPairs = new Set([...this.processedPairs, ...checkedPairs]);
            //TODO: treat differently the common events where participants are there full range
        }

        // External Collisions needs the pairs
        for (const planning of plannings) {
            const internalEvents = this.internalEventsMap.get(planning.staff_id);

            for (const otherPlanning of plannings) {
                const other_id = otherPlanning.staff_id;

                // don't compare with yourself
                if (planning.staff_id === other_id) {
                    continue;
                }
                // avoid empty plannings (or off days)
                if (otherPlanning.calendar_events.length === 0) {
                    continue;
                }

                const externalEvents = this.internalEventsMap.get(other_id);
                const externalCollisions = new BatchEventColliderModule({
                    eventsToCollide: [...internalEvents, ...externalEvents],
                    pairExclusionSet: this.processedPairs
                });

                const { positiveCollisionlist, checkedPairs } = externalCollisions;

                planning.collisions.external[other_id] = {
                    crossEvent: [...positiveCollisionlist],
                    maxCollisions: this.findMaxCollisions(positiveCollisionlist.map(collision => collision.referenceEvent))
                };

                this.processedPairs = new Set([...this.processedPairs, ...checkedPairs]);
            }
        }
    }
}