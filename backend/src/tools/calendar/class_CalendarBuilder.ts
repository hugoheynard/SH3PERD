import {planningObjectBuilder, type Plannings} from "./Builders/planningObjectBuilder";
import {type EventBuilderOutput, eventObjectBuilder} from "./Builders/eventObjectBuilder";
import {TimestampsBuilder} from "./Builders/TimestampsBuilder";
import {LayoutBuilder} from "./Builders/LayoutBuilder";
import {PlanningCollisionManager} from "./class PlanningCollisionManager.ts";
import {InternalCollisionsBuilder} from "./Builders/InternalCollisionsBuilder";
import type {CalendarEvent} from "../../interfaces/CalendarEvent";

export class CalendarBuilder {
    constructor() {
        //this.eventsBuilder = new EventsBuilder();
        //this.planningBuilder = new PlanningBuilder();

        //this.timestampsBuilder = new TimestampsBuilder();
        //this.layoutBuilder = new LayoutBuilder();
        //this.planningCollisionManager = new PlanningCollisionManager();
        //this.internalCollisionBuilder = new InternalCollisionsBuilder();

        this.cache = {}
    };

    build(input: { users: any, calendarEvents: CalendarEvent[] }): any {
        const { users, calendarEvents } = input;


        const eventsObject: EventBuilderOutput = eventObjectBuilder({ events: calendarEvents });

        const plannings: Plannings[] = planningObjectBuilder({
            users: users,
            calendarEvents: calendarEvents
        });

        //const timestamps = this.timestampsBuilder.build({calendarEvents: calendarEvents});
        //const internalCollisions = this.internalCollisionBuilder.build({plannings, events});

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
    }
}