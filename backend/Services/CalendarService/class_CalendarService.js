import {table_club, table_rehearsals} from "../../../db/fakeDB-Activities.js";
import {sortBlockArrayPerTime} from "../../Utilities/sortBlockArray.js";
//import {table_guests} from "./class_Guest.js";
import {Activity} from "../../Classes/Activity_classes/class_Activity.js";
import {rehearsalDependencies} from "../../Planning_Algo/Morning_Builder_Algo/rehearsal_dependencies.js";
import {Auto_GetIn} from "../../Planning_Algo/BlockGenerators/blockGen_autoGetIn.js";
import {Auto_TechSetup} from "../../Planning_Algo/BlockGenerators/blockGen_autoTechSetUp/blockGen_autoTechSetUp.js";
import {testFrameGenBlock} from "../../Classes/class_Auto_Club.js";
import {DateMethod} from "../../Utilities/class_DateMethods.js";
import {app_db} from "../../app.js";

/**
 * @method activeStaffPool: go through the contracts and find the staff on active period, returns array
 */

export class CalendarService {
    constructor() {
        //this.date = DateMethod.today;
        //this.endTime = input.endTime;
        this._timetable = [];
        //this.staff = input.staff;
        //this.calendar_events = input.calendar_events;

        this.club = testFrameGenBlock
    };

    get timetable() {
        return sortBlockArrayPerTime(this._timetable);
    };

    async build(date) {
        this.date = await date
        this.staff = await this.getActiveStaffPool(new Date(date));
        this.calendar_events = await this.getCalendarEvents(new Date(date));


        this.timetable.push(...this.calendar_events);

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
    };
    async getActiveStaffPool(date) {
        return await app_db.collection('contracts')
            .aggregate([
                {
                    $match: {
                        startDate: { $lte: new Date(date) },
                        endDate: { $gte: new Date(date) }
                    }
                },
                {
                    $lookup: {
                        from: 'staffs',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'staff'
                    }
                },
                {
                    $unwind: "$staff"
                },
                {
                    $project: {
                        _id: 0,
                        staff: 1
                    }
                }

            ])
            .toArray()
            .then(res => res.map(entry => entry.staff))
        //.then(res => res.map(staff => staff._id.toString()));

    }

    async getCalendarEvents(date) {
        return await app_db.collection('calendar_events')
            .find({
                date: {
                    $gte: DateMethod.startOfDay(date),
                    $lt: DateMethod.endOfDay(date)
                }
            })
            .toArray()
    }
}