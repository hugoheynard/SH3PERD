
import {CalendarService} from "./class_CalendarService.js";

export class CalendarController {
    constructor() {
        this.calendarService = new CalendarService();
    };
    async collectData(date) {
        this.currentData = {};
        this.staff = await this.calendarService.ressourceProvider.getActiveStaffPool(new Date(date));
        this.calendar_events = await this.calendarService.ressourceProvider.getCalendarEvents(new Date(date));

        this.currentData = this.calendarService.builder.build(this.staff, this.calendar_events);



        const generatedGetIn = this.calendarService.eventGenerator.autoGetIn.generate(this.currentData);
        this.mergeEvents(generatedGetIn, this.currentData);

        this.calendarService.eventCollider.findCollisionList(this.currentData);

        return this.currentData;
    };

    mergeEvents(events, data) {

        if (!Array.isArray(events)) {
            events.toArray();
        }

        for (const event of events) {
            //checker si event déjà dans l'array

            data.events = {
                [event.temp_id]: {...event},
                ...data.events
            }

            data.plannings
                .filter(planning => event.participants.includes(planning.staff_id))
                .map(planning => planning.calendar_events.push(event.temp_id));
        }
    }
}