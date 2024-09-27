export class CalendarBuilder {
    buildStaffObject(activeStaff, calendarEvents) {
        const plannings = [];

        for (const staff of activeStaff) {

            const staffPlanning = {
                staff_id: staff._id.toString(),
                firstName: staff.firstName,
                functions: {
                    category: staff.functions.category
                },
                //filters events per staff
                calendar_events: calendarEvents
                    .filter(event => event.participants
                        .map(participant => participant.toString()).includes(staff._id.toString())
                    ).map(event => event._id.toString())
            };
            plannings.push(staffPlanning);
        }
        this.plannings = plannings;
        return this.plannings;
    };
    buildEventsObject(calendarEvents) {
        return calendarEvents
            .reduce((acc, curr) => {
                acc[curr._id.toString()] = curr;
                return acc;
            }, {})
    };
    build(activeStaff, calendarEvents) {
        const build =  {
            events: this.buildEventsObject(calendarEvents),
            plannings: this.buildStaffObject(activeStaff, calendarEvents)
        };
        return build
    }
}