export class CalendarBuilder {
    buildPlanningObject(activeStaff, calendarEvents) {
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
        return plannings;
    };
    /**
     * Converts an array of calendar event objects into an object,
     * where each key is the event's `_id` (converted to a string)
     * and the value is the event object itself.
     *
     * @param {Array<Object>} calendarEvents - An array of calendar event objects.
     * Each object should contain an `_id` property, which can be a number or string.
     *
     * @returns {Object} An object where the keys are the `_id` values of each event
     * (converted to strings), and the values are the event objects.
     */
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
            plannings: this.buildPlanningObject(activeStaff, calendarEvents)
        };
        return build
    }
}