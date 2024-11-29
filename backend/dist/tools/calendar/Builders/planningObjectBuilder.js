import { mapEventsToUser } from "./utilities/mapEventsToUser.js";
import { addUserInformations, } from "./utilities/addUserInformations.js";
export const planningObjectBuilder = (input) => {
    const { users, calendarEvents } = input;
    const plannings = [];
    for (const user of users) {
        const userIdString = user._id.toString();
        const userEvents = mapEventsToUser({ events: calendarEvents, user_id: userIdString });
        const individualPlanning = {
            staff_id: userIdString,
            userInformations: addUserInformations(user),
            calendar_events: userEvents
        };
        plannings.push(individualPlanning);
    }
    return plannings;
};
//# sourceMappingURL=planningObjectBuilder.js.map