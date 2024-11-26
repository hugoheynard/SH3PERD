import {substractMinutes} from "../../../utilities/dateFunctions/date_functions";


export const calculateGetIn_eventGenerator = (input: any): any => {
    const {eventSorter_ascendingOrder, eventsArray, staff_id} = input;

    const firstEvent = eventSorter_ascendingOrder(eventsArray)[0];

    return {
        date: substractMinutes(firstEvent.date, 5 /*eventTypeRule Object*/),
        duration: 5,
        participants: [staff_id],
        type: 'getIn',
        generated: true
    };
}