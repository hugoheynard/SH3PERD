import {inBetweenDates, indexOfDay} from "../../../Utilities/Date_functions.js";
import {table_WeeklyEvents} from "../../../../db/fakeDB-events.js";

const getRecurrentEvents = (date) => {

    //importTableContent db functions
    const table = table_WeeklyEvents;

    //filter
    return table.filter(event => {

        if (inBetweenDates(date, event.firstEventDate, event.lastEventDate)) {

            if(indexOfDay(date) === event.dayIndex) {

                return event
            }

        }

    });

}

export {getRecurrentEvents};