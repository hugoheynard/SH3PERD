export class PlanningBuilder{
    build(input) {
        const { users, calendarEvents } = input;

        const plannings = [];

        for (const user of users) {

            const staffPlanning = {
                staff_id: user._id.toString(),
                firstName: user.firstName,
                functions: {
                    category: user.functions.category
                },
                //filters events per staff
                calendar_events: calendarEvents
                    .filter(event => event.participants
                        .map(participant => participant.toString()).includes(user._id.toString())
                    ).map(event => event._id.toString())
            };
            plannings.push(staffPlanning);
        }
        return plannings;
    };
}