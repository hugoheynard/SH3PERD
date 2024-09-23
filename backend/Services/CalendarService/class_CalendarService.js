import {CalendarRessourceProvider} from "./class_CalendarRessourceProvider.js";
import {CalendarController} from "./class_CalendarController.js";
import {table_club, table_rehearsals} from "../../../db/fakeDB-Activities.js";
import {Activity} from "../../Classes/Activity_classes/class_Activity.js";
import {rehearsalDependencies} from "../../Planning_Algo/Morning_Builder_Algo/rehearsal_dependencies.js";
import {Auto_GetIn} from "../../Planning_Algo/BlockGenerators/blockGen_autoGetIn.js";
import {Auto_TechSetup} from "../../Planning_Algo/BlockGenerators/blockGen_autoTechSetUp/blockGen_autoTechSetUp.js";
import {testFrameGenBlock} from "../../Classes/class_Auto_Club.js";


/**
 * @method activeStaffPool: go through the contracts and find the staff on active period, returns array
 */

export class CalendarService {
    constructor() {
        this.ressourceProvider = new CalendarRessourceProvider();
        this.controller = new CalendarController();

        this.club = testFrameGenBlock
    };
    async collectData(date) {
        this.staff = await this.ressourceProvider.getActiveStaffPool(new Date(date));
        this.calendar_events = await this.ressourceProvider.getCalendarEvents(new Date(date));

        return this.processData_buildStaffPlanningObject(this.staff, this.calendar_events)
    };
    processData_buildStaffPlanningObject(activeStaff, calendarEvents) {
        /*Only passes the reference ID for the events */
        const plannings = [];

        for (const staff of activeStaff) {

            const staffPlanning = {
                staff_id: staff._id.toString(),
                firstName: staff.firstName,
                functions: {
                    category: staff.functions.category
                },
                //filters events per staff
                calendar_events: calendarEvents
                    .filter(event => event.participants
                        .map(participant => participant.toString()).includes(staff._id.toString())
                    ).map(event => event._id.toString())
            };
            plannings.push(staffPlanning);
        }

        return {
            //Converts event in key 'id-string' value '{event}'
            events: calendarEvents
                .reduce((acc, curr) => {
                    acc[curr._id.toString()] = curr;
                    return acc;
                }, {}),
            plannings: plannings
        };
    };

/*
        //AUTO TECH SETUP
        this.timeTable.push(
            ...new Auto_TechSetup(
            {
                timeTable: this.timeTable,
                date: this.date
            }).buildTechBlocks());

        //AUTO GET IN
        this.timeTable.push(
            ...new Auto_GetIn(
                {
                    timeTable: this.timeTable,
                }).buildGetInBlocks()
        );
*/


}