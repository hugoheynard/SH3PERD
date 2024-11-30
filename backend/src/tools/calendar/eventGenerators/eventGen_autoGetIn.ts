import {addMinutes, substractMinutes} from "../../../utilities/dateFunctions/date_functions";
import {sortEventsArrayPerAscendingTime} from "../../../utilities/sortEventsArrayPerAscendingTime";
import {type CalendarEvent} from "../../../interfaces/CalendarEventsObject";
import pkg from 'lodash';
const { isEqual } = pkg;

/**
*ROLE : manage GetInBlocks for a list of event
*HOW By knowing which task/block is the first in the day of a staffMember, we can define the arrival time
*MUST : be called after all the other push of blocks
*/

export class Auto_GetIn {
    private readonly ascendingDateArraySorter: (array: CalendarEvent[]) => CalendarEvent[];
    private readonly events: CalendarEvent[];
    private readonly staff_id: string;
    private readonly getInDuration: number;
    private readonly arrivalTimeSettingsObject: {
        [key: string]: number;
    }

    constructor(input: any) {
        this.ascendingDateArraySorter = input.ascendingDateArraySorter;
        this.events = this.ascendingDateArraySorter(input.events);
        this.staff_id = input.staff_id;
        this.getInDuration = input.getInDuration;
        this.arrivalTimeSettingsObject = input.arrivalTimeSettingsObject;
    };

    execute(): CalendarEvent | null{
        const generatedGetInEvent: CalendarEvent | null= this.generateGetInEvent();
        const existingGetInEvent: CalendarEvent | null= this.getExistingGetInEvent();

        if (!existingGetInEvent) {

        }

        if (this.compareGeneratedEventWithExisting({ generatedEvent: generatedGetInEvent, existingEvent: existingGetInEvent })) {
            return null;
        }

        return generatedGetInEvent;
    };



    getTimeToArriveBeforeFirstEvent(input: { firstEvent: CalendarEvent }): number {
        const { firstEvent } = input;

        if (!firstEvent.type) {
            return this.arrivalTimeSettingsObject['default'];
        }

        return this.arrivalTimeSettingsObject[firstEvent.type];
    };

    generateGetInEvent(): CalendarEvent | null{
        const firstEvent: CalendarEvent = this.events.filter((ev: CalendarEvent): boolean => ev.type !== 'getIn')[0];

        if (!firstEvent || firstEvent.type === 'off') {
            return null;
        }

        const startDate: Date = substractMinutes(firstEvent.startDate, this.getTimeToArriveBeforeFirstEvent({ firstEvent: firstEvent}));
        const endDate: Date = addMinutes(startDate, this.getInDuration);

        return {
            startDate: startDate,
            endDate: endDate,
            participants: [this.staff_id],
            type: 'getIn',
            generated: true
        };
    };

    /**
     * If true, existingEvent is valid;
     * @param input
     */
    compareGeneratedEventWithExisting(input: { generatedEvent: CalendarEvent; existingEvent: CalendarEvent; }): boolean {
        const existingEventCopy: CalendarEvent = {...input.existingEvent};
        delete existingEventCopy._id;

        return isEqual(input.generatedEvent, existingEventCopy);
    };

    getExistingGetInEvent(): CalendarEvent | null{
        const existing: any = this.events.find((event: CalendarEvent): boolean => event.type === 'getIn');

        if (!existing) {
            return null;
        }

        return existing;
    };


}

/*
//insert autoGetIn
new Auto_GetIn({
    ascendingDateArraySorter: sortEventsArrayPerAscendingTime,
    getInDuration: 5,
    arrivalTimeSettingsObject: {
        'default': 60,
        'techSetUp': 5,
        'meeting': 5,
        'meal': 5,
        'rehearsal': 15,
        'show': 60
    }
}).execute();
*/