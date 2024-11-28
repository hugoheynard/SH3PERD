import { planningObjectBuilder } from "./Builders/planningObjectBuilder.js";
import { eventObjectBuilder } from "./Builders/eventObjectBuilder.js";
export class CalendarBuilder {
    constructor() {
        //this.eventsBuilder = new EventsBuilder();
        //this.planningBuilder = new PlanningBuilder();
        //this.layoutBuilder = new LayoutBuilder();
        //this.planningCollisionManager = new PlanningCollisionManager();
        //this.internalCollisionBuilder = new InternalCollisionsBuilder();
        this.cache = {};
    }
    ;
    build(input) {
        const { users, calendarEvents } = input;
        const eventsObject = eventObjectBuilder({ events: calendarEvents });
        const plannings = planningObjectBuilder({
            users: users,
            calendarEvents: calendarEvents
        });
        //const internalCollisions = this.internalCollisionBuilder.build({plannings, events});
        /*
        const layout = this.layoutBuilder.build({
            plannings: plannings,
            timestamps: timestamps,
            internalCollisions: internalCollisions
        });


        return {
            specs: {
                timestamps: timestamps,
                layout: layout
            },
            collisions: {
                internal: internalCollisions
            },
            events: eventsObject,
            plannings: plannings
        };
        */
        return {
            events: eventsObject,
            plannings: plannings
        };
    }
}
//# sourceMappingURL=class_CalendarBuilder.js.map