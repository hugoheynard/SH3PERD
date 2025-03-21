import type {Collection} from "mongodb";
import type {UserService} from "./userService";
import type {User} from "../interfaces/User";
import type {PlanningBlocksService} from "../planningBlocks/planningBlocksService";
import type {CalendarEvent} from "../planningBlocks/interfaces_events/CalendarEventsObject";
import {CalendarBuilder} from "../tools/calendar/CalendarBuilder";

export interface CalendarService {
    input: {
        collection?: Collection<any>;
        userService: UserService['output'];
        eventService: PlanningBlocksService['output'];
    };
    output: {
        getCalendarData: (input: { users: string[]; date: Date }) => Promise<any>;
    };

}

export const calendarService = (input: CalendarService['input']): CalendarService['output'] => {
    const  { userService, eventService } = input;

    return {
        async getCalendarData(input) {
            const {users, date} = input;

            try{
                const resultEvents: CalendarEvent[] = await eventService.eventSearch({
                    queryParams: {
                        participants: users,
                        date: date
                    }
                });

                const resultUsers: User[] = await userService.userSearch({ usersId: users });

                return new CalendarBuilder({
                    users: resultUsers,
                    calendarEvents: resultEvents
                }).build();
            }catch(err){
                throw err;
            }
        },
    };
};