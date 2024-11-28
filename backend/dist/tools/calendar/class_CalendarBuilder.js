import { planningObjectBuilder } from "./Builders/planningObjectBuilder.js";
import { eventObjectBuilder } from "./Builders/eventObjectBuilder.js";
import { InternalCollisionsBuilder } from "./Builders/InternalCollisionsBuilder.js";
export class CalendarBuilder {
    //Dependencies
    eventObjectBuilder = eventObjectBuilder;
    planningObjectBuilder = planningObjectBuilder;
    internalCollisionBuilder = new InternalCollisionsBuilder();
    constructor() {
        //this.planningCollisionManager = new PlanningCollisionManager();
    }
    ;
    build(input) {
        const { users, calendarEvents } = input;
        const eventsObject = this.eventObjectBuilder({ events: calendarEvents });
        const plannings = this.planningObjectBuilder({
            users: users,
            calendarEvents: calendarEvents
        });
        const internalCollisions = this.internalCollisionBuilder.build({ plannings: plannings, events: eventsObject });
        return {
            events: eventsObject,
            plannings: plannings
        };
    }
    ;
}
//# sourceMappingURL=class_CalendarBuilder.js.map