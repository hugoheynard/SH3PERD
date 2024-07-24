import {getRecurrentEvents} from "./getRecurrentEvents.js";
import {getElementsFromTable} from "./getElementsFromTable.js";
import {table_privateEvents} from "../../../../db/fakeDB-events.js";

const getEvents = date => {

    return {

        recurrentEvents: getRecurrentEvents(date),
        //specialEvents: getSpecialEvents(date),
        privateEvents: getElementsFromTable(date, table_privateEvents),
        //happeningEvents: getHappeningEvents(date)

    }

}

export {getEvents};