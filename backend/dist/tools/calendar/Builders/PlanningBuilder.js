import { mapEventsToUser } from "./utilities/mapEventsToUser.js";
import { AddUserInformationOutput, addUserInformations } from "./utilities/addUserInformations.js";
export const planningObjectBuilder = (input) => {
    const { users, calendarEvents } = input;
    const plannings = [];
    for (const user of users) {
        const userIdString = user._id.toString();
        const userEvents = mapEventsToUser({ calendarEvents, userIdString });
        const individualPlanning = {
            staff_id: userIdString,
            ...addUserInformations(user),
            calendar_events: userEvents
        };
        plannings.push(individualPlanning);
    }
    return plannings;
};
//# sourceMappingURL=PlanningBuilder.js.map