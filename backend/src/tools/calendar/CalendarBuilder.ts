import {planningObjectBuilder, type Plannings} from "./builders/planningObjectBuilder";
import {eventObjectBuilder, type EventBuilderOutput} from "./builders/eventObjectBuilder";
import type {CalendarEvents_interface} from "../../interfaces/CalendarEvents_interface";
import {type CollisionObject, InternalCollisionsBuilder} from "./builders/InternalCollisionsBuilder";

export class CalendarBuilder {
    //Dependencies
    private readonly eventObjectBuilder = eventObjectBuilder;
    private readonly planningObjectBuilder = planningObjectBuilder;
    private readonly internalCollisionBuilder = new InternalCollisionsBuilder();
    constructor() {
        //this.planningCollisionManager = new PlanningCollisionManager();
    };

    build(input: { users: any, calendarEvents: CalendarEvents_interface[] }): any {
        const { users, calendarEvents } = input;

        const eventsObject: EventBuilderOutput = this.eventObjectBuilder({ events: calendarEvents });

        const plannings: Plannings[] = this.planningObjectBuilder({
            users: users,
            calendarEvents: calendarEvents
        });

        const internalCollisions: CollisionObject = this.internalCollisionBuilder.build({ plannings: plannings, events: eventsObject });


        return {
            events: eventsObject,
            plannings: plannings,
            collisions: internalCollisions
        }
    };
}