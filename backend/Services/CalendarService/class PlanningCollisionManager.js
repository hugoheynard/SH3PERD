import {BatchEventColliderModule} from "../functionnalities/class_BatchEventColliderModule.js";

export class PlanningCollisionManager {
    constructor(){
    };
    execute(data) {
        this.data = data;

        this.planningMap = new Map();
        this.initMapping();

        this.processedPairs = new Set();
        this.collideEvents();
        this.manageCollisions();
    };

    collideEvents() {
        //TODO out when working
        this.collisions = new BatchEventColliderModule({eventsToCollide: Object.values(this.data.events)});
    };
    initMapping() {
        this.mapPlannings();
    };
    mapPlannings() {
        for (const planning of this.data.plannings) {
            planning.collisions =  {
                internal: {},
                external: {}
            };
            this.planningMap.set(planning.staff_id, planning);
        }
    };

    findMaxCollisions(eventRefArray) {
        const eventCountMap = new Map();

        for (const ref of eventRefArray) {
            eventCountMap.set(ref, (eventCountMap.get(ref) || 0) + 1);
        }

        return Math.max(...Array.from(eventCountMap.values()));
    };


    manageCollisions() {
        for (const [staffId, planning] of this.planningMap) {

            if (!planning.calendar_events) {
                continue;
            }

            //internal Collisions
            const internalEvents = planning.calendar_events.map(event => this.data.events[event]);
            const internalCollisions = new BatchEventColliderModule({eventsToCollide: internalEvents});

            const resultInternal = internalCollisions.positiveCollisionlist

            planning.collisions.internal = {
                crossEvent: [...resultInternal],
                maxCollisions: this.findMaxCollisions(resultInternal.map(collision => collision.referenceEvent))
            };
            this.processedPairs = new Set([...this.processedPairs, ...internalCollisions.checkedPairs]);

            // External Collisions
            for (const [otherStaffId, otherPlanning] of this.planningMap) {

                // don't compare with yourself
                if (staffId === otherStaffId || !otherPlanning.calendar_events) {
                    continue;
                }

                const externalEvents = otherPlanning.calendar_events.map(event => this.data.events[event]);
                const externalCollisions = new BatchEventColliderModule({
                    eventsToCollide: internalEvents,
                    externalEvents: externalEvents,
                    pairExclusionSet: this.processedPairs
                });

                const result = externalCollisions.positiveCollisionlist

                planning.collisions.external = planning.collisions.external || {};
                planning.collisions.external[otherStaffId] = {
                    crossEvent: [...result],
                    maxCollisions: this.findMaxCollisions(result.map(collision => collision.referenceEvent))
                };

                this.processedPairs = new Set([...this.processedPairs, ...externalCollisions.checkedPairs]);
            }
        }
    }
}