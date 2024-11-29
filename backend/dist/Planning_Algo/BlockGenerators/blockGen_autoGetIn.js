import { addMinutes, substractMinutes } from "../../utilities/dateFunctions/date_functions.js";
import { sortEventsArrayPerAscendingTime } from "../../utilities/sortEventsArrayPerAscendingTime.js";
import { isEqual } from 'lodash';
import {} from "../../interfaces/CalendarEvents_interface.js";
/**
*ROLE : manage GetInBlocks for a list of event
*HOW By knowing which task/block is the first in the day of a staffMember, we can define the arrival time
*MUST : be called after all the other push of blocks
*/
export class Auto_GetIn {
    ascendingDateArraySorter;
    updateEventInDb;
    events;
    staff_id;
    getInDuration;
    arrivalTimeSettingsObject;
    constructor(input) {
        this.ascendingDateArraySorter = sortEventsArrayPerAscendingTime; //TODO injecter depuis l'extérieur
        this.updateEventInDb = input.updateEventInDb;
        this.events = this.ascendingDateArraySorter(input.events);
        this.staff_id = input.staff_id;
        this.getInDuration = input.getInDuration;
        this.arrivalTimeSettingsObject = {
            'default': 60,
            'techSetUp': 5,
            'meeting': 5,
            'meal': 5,
            'rehearsal': 15,
            'show': 60
        };
    }
    ;
    execute() {
        const generatedGetInEvent = this.generateGetInEvent();
        const existingGetInEvent = this.getExistingGetInEvent();
        if (!existingGetInEvent) {
        }
        if (this.compareGeneratedEventWithExisting({ generatedEvent: generatedGetInEvent, existingEvent: existingGetInEvent })) {
            return;
        }
        this.updateGetInEventInCollection({ generatedEvent: generatedGetInEvent, existingEvent_id: existingGetInEvent._id });
    }
    ;
    updateGetInEventInCollection(input) {
    }
    ;
    getTimeToArriveBeforeFirstEvent(input) {
        const { firstEvent } = input;
        if (!firstEvent.type) {
            return this.arrivalTimeSettingsObject['default'];
        }
        return this.arrivalTimeSettingsObject[firstEvent.type];
    }
    ;
    generateGetInEvent() {
        const firstEvent = this.events[0];
        if (!firstEvent || firstEvent.type === 'off') {
            return;
        }
        const startDate = substractMinutes(firstEvent.startDate, this.getTimeToArriveBeforeFirstEvent());
        const endDate = addMinutes(startDate, this.getInDuration);
        return {
            startDate: startDate,
            endDate: endDate,
            participants: [this.staff_id],
            type: 'getIn',
            generated: true
        };
    }
    ;
    /**
     * If true, existingEvent is valid;
     * @param input
     */
    compareGeneratedEventWithExisting(input) {
        const existingEventCopy = { ...input.existingEvent };
        delete existingEventCopy._id;
        return isEqual(input.generatedEvent, existingEventCopy);
    }
    ;
    getExistingGetInEvent() {
        const existing = this.events.find((event) => event.type === 'getIn');
        if (!existing) {
            return null;
        }
        return existing;
    }
    ;
}
//# sourceMappingURL=blockGen_autoGetIn.js.map