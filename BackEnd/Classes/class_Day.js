import {getEvents} from "../Planning_Builder/Day_builder/DB_functions/getEvents.js";
import {getActiveStaffPool} from "../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";
import {getElementsFromTable} from "../Planning_Builder/Day_builder/DB_functions/getElementsFromTable.js";
import {table_club, table_meetings, table_rehearsals} from "../../db/fakeDB-Activities.js";
import {sortBlockArrayPerTime} from "../Utilities/sortBlockArray.js";
//import {table_guests} from "./class_Guest.js";
import {Activity} from "./Activity_classes/class_Activity.js";
import {rehearsalDependencies} from "../Planning_Algo/Morning_Builder_Algo/rehearsal_dependencies.js";
import {Auto_GetIn} from "../Planning_Algo/BlockGenerators/blockGen_autoGetIn.js";
import {Auto_TechSetup} from "../Planning_Algo/BlockGenerators/blockGen_autoTechSetUp/blockGen_autoTechSetUp.js";
import {Auto_Club, testFrameGenBlock} from "./class_Auto_Club.js";


class Day {
    constructor(input) {
        this.date = input.date;
        this.endTime = input.endTime;
        this.staff = getActiveStaffPool(this.date);
        //this.guests = getElementsFromTable(this.date, table_guests);
        this.events = getEvents(this.date);
        this.meetings = getElementsFromTable(this.date, table_meetings);
        this.shows = getElementsFromTable(this.date, table_club)
        this.activities = getElementsFromTable(this.date, table_rehearsals);
        this._timeTable = [];//getTimeTable(this.date);
        this.guestBlocks = [];

        this.club = testFrameGenBlock

    };

    get timeTable() {
        return sortBlockArrayPerTime(this._timeTable);
    };

    build() {
        this.events.privateEvents.forEach(event => {
            this.timeTable.push(event)
        });

        this.shows.forEach(show => {
            //this.timeTable.push(show)
        });

        this.meetings.forEach(event => {
            this.timeTable.push(event)
        });

        this.activities.forEach(event => {
            this.timeTable.push(event)
            //this.timeTable.push(...rehearsalDependencies(event, this.staff));
        });

        this.timeTable.push(...this.club)


        /*AUTO TECH SETUP*/
        this.timeTable.push(
            ...new Auto_TechSetup(
            {
                timeTable: this.timeTable,
                date: this.date
            }).buildTechBlocks());

        /*AUTO GET IN*/
        this.timeTable.push(
            ...new Auto_GetIn(
                {
                    timeTable: this.timeTable,
                }).buildGetInBlocks()
        );


    };

}






const testDay = [
    new Day(
    {
        date: new Date(2024, 11, 19),
        endTime: [20, 0]
    })
]

testDay[0].build();



export {Day};
export {testDay};