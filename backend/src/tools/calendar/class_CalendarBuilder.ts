import {planningObjectBuilder, type Plannings} from "./Builders/planningObjectBuilder";
import {eventObjectBuilder, type EventBuilderOutput} from "./Builders/eventObjectBuilder";
import type {CalendarEvent} from "../../interfaces/CalendarEvent";

export class CalendarBuilder {
    constructor() {
        //this.eventsBuilder = new EventsBuilder();
        //this.planningBuilder = new PlanningBuilder();

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
        }
    }
}