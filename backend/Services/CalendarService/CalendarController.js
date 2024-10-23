import {ObjectId} from "mongodb";
import {DateMethod} from "../../Utilities/class_DateMethods.js";

export class CalendarController {
    constructor(input) {
        this.calendarService = input.calendarService;
        this.userService = input.userService;
        this.eventService = input.eventService;
    };
    async buildUserCalendarData(req) {

    }

    async collectData(req) {
        const { date } = req.body;
        const authToken = {
            user: {
                id: '66e6e31d450539b53874aee5'
            },
            company: {
                id:'66f805b2e0137375bc1429fd'
            }
        };

        const events = await this.eventService.getEvents(
            new this.eventService.tools.queryBuilder({
                authToken: authToken,
                req: req.body
            })
        );

        const users = await this.userService.getUser(
            new this.userService.tools.queryBuilder({
                authToken: authToken,
                req: req.body
            })
        );


        const calendarData = new this.calendarService.tools.builder().build(users, events);
        new this.calendarService.tools.planningCollisionManager().execute(calendarData);

        //generates getIn events from data.events
        //const generatedGetIn = this.calendarService.eventGenerator.autoGetIn.generate(this.currentData);
        //this.mergeEvents(generatedGetIn, this.currentData);

        return calendarData;
    };


    mergeEvents(events, data) {

        if (!Array.isArray(events)) {
            events.toArray();
        }

        for (const event of events) {
            //checker si event déjà dans l'array

            data.events = {
                [event._id]: {...event},
                ...data.events
            }

            data.plannings
                .filter(planning => event.participants.includes(planning.staff_id))
                .map(planning => planning.calendar_events.push(event._id));
        }
    }
}