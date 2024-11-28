//import {EventGridPositionCalculator} from "../tools/calendar/EventGridPositionCalculator.js";
//import {CalendarBuilder} from "../tools/calendar/class_CalendarBuilder.js";
//import {PlanningCollisionManager} from "../tools/calendar/class PlanningCollisionManager.js";
//import {EventGenerator} from "../tools/calendar/class_EventGenerator.js";
import { userService } from "./userService.js";
import { eventService } from "./eventService.js";
import { addMinutes } from "../utilities/dateFunctions/date_functions.js";
import { DateMethod } from "../utilities/DateHelperFunctions.js";
import { planningObjectBuilder } from "../tools/calendar/builders/planningObjectBuilder.js";
import { CalendarBuilder } from "../tools/calendar/CalendarBuilder.js";
export const calendarService = (input) => {
    const { userService, eventService } = input;
    const tools = {
    //eventGridPositionCalculator: EventGridPositionCalculator,
    //builder: CalendarBuilder,
    //planningCollisionManager: PlanningCollisionManager,
    //eventGenerator: EventGenerator,
    //staffInteractionTool: StaffInteractionModule
    };
    return {
        async getCalendarData(input) {
            const { users, date } = input;
            const resultEvents = await eventService.eventSearch({
                participants: users,
                date: date
            });
            const resultUsers = await userService.userSearch({ usersId: users });
            //const plannings: Plannings[] = planningObjectBuilder({ users: resultUsers, calendarEvents: resultEvents });
            const result = new CalendarBuilder().build({ users: resultUsers, calendarEvents: resultEvents });
            return result;
            /*
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
                //console.log(sortedStaffPool)


                const calendarData = new this.calendarService.tools.builder()
                    .build(users, events);

                //const collidedData = new this.calendarService.tools.planningCollisionManager().manageCollisions(baseData);

                //generates getIn events from data.events
                //const generatedGetIn = this.calendarService.eventGenerator.autoGetIn.generate(this.currentData);
                //this.mergeEvents(generatedGetIn, calendarData);


                new this.calendarService.tools.eventGridPositionCalculator()
                    .calculate({
                        plannings: calendarData.plannings,
                        events: calendarData.events,
                        collisions: calendarData.collisions,
                        totalColumnsPerPlanning: calendarData.specs.layout.planningsColNumber,
                        offsetFromDayStart: calendarData.specs.layout.offsetFromDayStart,
                        planningGridIndexes: calendarData.specs.layout.planningsGridIndexes,
                        addMinutesFunction: addMinutes,
                        stepDuration: DateMethod.STEP_DURATION
                    });

                //console.log(calendarData.plannings[0])

                const eventsProcessed = (() => {
                    const arr = []

                    for (const planning of calendarData.plannings) {
                        const res = planning.calendar_events
                            .map(event_id => {
                                const event = calendarData.events[event_id]

                                event.user = planning.staff_id;
                                event.gridCoordinates = planning.eventGridPositions[event_id];

                                arr.push(event)
                            })

                        //console.log(arr)
                    }

                    return arr
                })();

                const hoursList = (() => {
                    const {earliestEventTimestamp, latestEventTimestamp} = calendarData.specs.timestamps;
                    const {offsetFromDayStart} = calendarData.specs.layout;
                    const stepArray = [];

                    let step = earliestEventTimestamp;
                    while (step <= latestEventTimestamp) {

                        if (step.getMinutes() === 0) {
                            stepArray.push(step);
                        }

                        step = DateMethod.addMinutes(step, 5);
                    }
                    return stepArray.map(hour => {
                        return {
                            timestamp: hour,
                            rowStart: (() => {
                                let rowStart = getPositionFromDate(hour) - offsetFromDayStart - 1;

                                if (rowStart < 0) {
                                    //To manage the exception to an event going after midnight, we add a full day as a positive offset
                                    rowStart += DateMethod.ONE_DAY_IN_STEPS;
                                }
                                return rowStart
                            })()
                        }
                    });
                })();


                console.log({
                    timestamps: {
                        ...calendarData.specs.timestamps,
                        hoursList: hoursList
                    },
                    layout: calendarData.specs.layout,
                    events: eventsProcessed
                })
                return {
                    timestamps: {
                        ...calendarData.specs.timestamps,
                        hoursList: hoursList
                    },
                    layout: calendarData.specs.layout,
                    events: eventsProcessed
                }

                 */
        },
        mergeEvents(events, data) {
            if (!Array.isArray(events)) {
                events.toArray();
            }
            for (const event of events) {
                //checker si event déjà dans l'array
                data.events = {
                    [event._id]: { ...event },
                    ...data.events
                };
                data.plannings
                    .filter(planning => event.participants.includes(planning.staff_id))
                    .map(planning => planning.calendar_events.push(event._id));
            }
        },
    };
};
//# sourceMappingURL=calendarService.js.map