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

    //inputs
    private readonly users: User[];
    private readonly calendarEvents: CalendarEvent[];

    constructor(input: { users: User[]; calendarEvents: CalendarEvent[] }) {
        this.users = input.users;
        this.calendarEvents = input.calendarEvents;
        //this.planningCollisionManager = new PlanningCollisionManager();
    };

    build(): any {
        const eventsObject: CalendarEventsObject = this.eventObjectBuilder({ events: this.calendarEvents });

        const plannings: Plannings[] = this.planningObjectBuilder({
            users: this.users,
            calendarEvents: this.calendarEvents
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