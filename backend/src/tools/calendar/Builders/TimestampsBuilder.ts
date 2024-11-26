import {DateMethod} from "../../../../Utilities/class_DateMethods.js";

export class TimestampsBuilder {
    build(input) {
        // Compare and assign the earliest and latest event
        let earliestEvent = null
        let latestEvent = null

        input.calendarEvents
            .reduce((acc, curr) => {
                if (!earliestEvent || new Date(curr.date) < new Date(earliestEvent.date)) {
                    earliestEvent = curr;
                }

                if (!latestEvent || new Date(curr.date) > new Date(latestEvent.date)) {
                    latestEvent = curr;
                }

                return acc;
            }, {});

        return {
            dayStartTimestamp: DateMethod.startOfDay(new Date(earliestEvent.date)),
            earliestEventTimestamp: earliestEvent.date,
            latestEventTimestamp: DateMethod.addMinutes(latestEvent.date, latestEvent.duration),
        };
    };
}