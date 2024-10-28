import {PlanningBuilder} from "./Builders/PlanningBuilder.js";
import {EventsBuilder} from "./Builders/EventsBuilder.js";
import {TimestampsBuilder} from "./Builders/TimestampsBuilder.js";
import {LayoutBuilder} from "./Builders/LayoutBuilder.js";
import {PlanningCollisionManager} from "./class PlanningCollisionManager.js";
import {InternalCollisionsBuilder} from "./Builders/InternalCollisionsBuilder.js";

export class CalendarBuilder {
    constructor() {
        this.planningBuilder = new PlanningBuilder();
        this.eventsBuilder = new EventsBuilder();
        this.timestampsBuilder = new TimestampsBuilder();
        this.layoutBuilder = new LayoutBuilder();
        this.planningCollisionManager = new PlanningCollisionManager();
        this.internalCollisionBuilder = new InternalCollisionsBuilder();

        this.cache = {}
    };

    build(activeStaff, calendarEvents) {
        const plannings = this.planningBuilder.build({ users: activeStaff, calendarEvents: calendarEvents});
        const events = this.eventsBuilder.build({ calendarEvents: calendarEvents });
        const timestamps = this.timestampsBuilder.build({ calendarEvents: calendarEvents });

        const internalCollisions = this.internalCollisionBuilder.build({ plannings, events });

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
            events: events,
            plannings: plannings
        };
    }
}