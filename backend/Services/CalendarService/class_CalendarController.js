import {CalendarService} from "./class_CalendarService.js";
import {app_db} from "../../app.js";

export class CalendarController {
    constructor() {
        this.calendarService = new CalendarService();
    };
    async collectData(date) {
        this.currentData = {};
        this.staff = await this.calendarService.ressourceProvider.getActiveStaffPool(new Date(date));
        this.calendar_events = await this.calendarService.ressourceProvider.getCalendarEvents(new Date(date));

        this.currentData = this.calendarService.builder.build(this.staff, this.calendar_events);

        this.calendarService.individualPlanningCollider.findCollisionList(this.currentData);
        this.currentData.crossEvents = this.calendarService.partnerPlanningCollider.calculate(this.currentData);

        const generatedGetIn = this.calendarService.eventGenerator.autoGetIn.generate(this.currentData);
        //this.mergeEvents(generatedGetIn, this.currentData); //TODO bug

        return this.currentData;
    };

    async postEvent(eventData) {
        const dateBuilder = input => {
            const date = new Date(input.date);
            const timeArray = input.time.split(':');
            date.setHours(timeArray[0]);
            date.setMinutes(timeArray[1]);
            return date
        }

        const preparedData = {
            date: dateBuilder({
                date: eventData.date,
                time: eventData.time
            }),
            duration: Number(eventData.duration),
            type: 'rehearsal'

        }

        return await app_db.collection('calendar_events').insertOne(preparedData);
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