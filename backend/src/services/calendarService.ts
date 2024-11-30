import type {Collection} from "mongodb";
//import {PlanningCollisionManager} from "../tools/calendar/class PlanningCollisionManager";
//import {EventGenerator} from "../tools/calendar/class_EventGenerator";
import {type UserService} from "./userService";
import {CalendarBuilder} from "../tools/calendar/CalendarBuilder";
import type {CalendarEventsObject} from "../interfaces/CalendarEventsObject";
import {Auto_GetIn} from "../tools/calendar/eventGenerators/eventGen_autoGetIn";



export interface CalendarServiceInput {
    collection?: Collection<any>;
    userService: UserService;
    eventService: any
}

export interface CalendarService {
    getCalendarData: (input: any) => Promise<any>
}

export const calendarService = (input: CalendarServiceInput): CalendarService => {
    const  { userService, eventService } = input;

    return {
        async getCalendarData(input: any): Promise<any> {
            const {users, date} = input;

            const resultEvents = await eventService.eventSearch({
                participants: users,
                date: date
            });

            const resultUsers = await userService.userSearch({usersId: users});

            const result = new CalendarBuilder()
                .build({users: resultUsers, calendarEvents: resultEvents})

            return result;

            /*
                 const sortedStaffPool = new this.userService.tools.staffSorter()
                .sortByHierarchy({
                    users: users,
                    customOrder: {
                        artistic: {
                            order: 1,
                            categories: {
                                dj: {
                                    order: 1,
                                    subCategories: {guest: 1}
                                },
                                musician: {
                                    order: 2,
                                    subCategories: {saxophone: 1}
                                },
                                singers: {
                                    order: 3,
                                    subCategories: {
                                        clubbing: 1,
                                        cabaret: 2
                                    }
                                },
                                dancers: {
                                    order: 4,
                                },
                                performers: {
                                    order: 5,
                                    subCategories: {
                                        aerial: 1,
                                        slackline: 2,
                                    }
                                },
                                others: {
                                    order: 6
                                }
                            }
                        }
                    }
                });

            async buildCalendarData(req) {
                const { date } = req.body;
                const authToken = {
                    user: {
                        id: '66e6e31d450539b53874aee5'
                    },
                    company: {
                        id: '66f805b2e0137375bc1429fd'
                    }
                };

                //getting events and user data from subServices
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





                const calendarData = new this.calendarService.tools.builder()
                    .build(users, events);

                //const collidedData = new this.calendarService.tools.planningCollisionManager().manageCollisions(baseData);


        },

*/
        }
    }
}