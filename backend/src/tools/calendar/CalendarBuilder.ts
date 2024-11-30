import {planningObjectBuilder, type Plannings} from "./builders/planningObjectBuilder";
import {eventObjectBuilder, type EventBuilderOutput} from "./builders/eventObjectBuilder";
import type {CalendarEvent, CalendarEventsObject} from "../../interfaces/CalendarEventsObject";
import {type CollisionObject, InternalCollisionsBuilder} from "./builders/InternalCollisionsBuilder";
import type {User} from "../../interfaces/User";

export class CalendarBuilder {
    //Dependencies
    private readonly eventObjectBuilder = eventObjectBuilder;
    private readonly planningObjectBuilder = planningObjectBuilder;
    private readonly internalCollisionBuilder = new InternalCollisionsBuilder();
    constructor() {
        //this.planningCollisionManager = new PlanningCollisionManager();
    };

    build(input: { users: User[], calendarEvents: CalendarEvent[] }): any {
        const { users, calendarEvents } = input;

        const eventsObject: CalendarEventsObject = this.eventObjectBuilder({ events: calendarEvents });

        const plannings: Plannings[] = this.planningObjectBuilder({
            users: users,
            calendarEvents: calendarEvents
        });

        const internalCollisions: CollisionObject = this.internalCollisionBuilder.build({
            plannings: plannings,
            events: eventsObject
        });


        return {
            events: eventsObject,
            plannings: plannings,
            collisions: internalCollisions
        }
    };
}