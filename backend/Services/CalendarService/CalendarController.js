export class CalendarController {
    constructor(input) {
        this.calendarService = input.service;
        this.userService = input.userService;
        this.eventService = input.eventService;
    };
    async collectData(req) {
        const { date } = req.body;

        const users = await this.userService.getUser(req);
        const events = await this.eventService.getEvents(req);
        console.log(events)

        this.currentData = this.calendarService.builder.build(users, events);
        this.calendarService.planningCollisionManager.execute(this.currentData)

        //generates getIn events from data.events
        const generatedGetIn = this.calendarService.eventGenerator.autoGetIn.generate(this.currentData);
        this.mergeEvents(generatedGetIn, this.currentData);

        return this.currentData;
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