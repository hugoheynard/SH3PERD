import type {CalendarEvent} from "../../../interfaces/CalendarEvent";
import {mapEventsToUser} from "./utilities/mapEventsToUser";
import {type AddUserInformationOutput, addUserInformations} from "./utilities/addUserInformations";

interface PlanningBuilderInput {
    users: any;
    calendarEvents: CalendarEvent[];
}

export interface Plannings {
    staff_id: string;
    userInformations: AddUserInformationOutput;
    calendar_events: string[];
}



export const planningObjectBuilder = (input: PlanningBuilderInput): Plannings[] => {
    const { users, calendarEvents } = input;
    const plannings: Plannings[] = [];

    for (const user of users) {
        const userIdString: string = user._id.toString();
        const userEvents: string[] = mapEventsToUser({ events: calendarEvents, user_id: userIdString });

        const individualPlanning: Plannings = {
            staff_id: userIdString,
            userInformations: addUserInformations(user),
            calendar_events: userEvents
        };

        plannings.push(individualPlanning);
    }

    return plannings;
};