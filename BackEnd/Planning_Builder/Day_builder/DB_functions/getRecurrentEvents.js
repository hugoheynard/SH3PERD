import {DateMethod} from "../../../Utilities/class_DateMethods.js";
import {table_WeeklyEvents} from "../../../../db/fakeDB-events.js";


const getRecurrentEvents = (date) => {
    const table = table_WeeklyEvents;

    //filter
    return table.filter(event => {

        if (DateMethod.inBetweenDates(date, event.firstEventDate, event.lastEventDate)) {

            if (DateMethod.indexOfDay(date) === event.dayIndex) {
                return event
            }
        }
    });
}

export {getRecurrentEvents};