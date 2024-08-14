import {Calendar} from "./class_Calendar.js";


class CalendarAll extends Calendar{
    constructor(timeTable, staffList, baseIndex) {
        super(timeTable, staffList, baseIndex = 0);
    };
    listGranularity(staffList) {
        return [staffList];
    };
}

export {CalendarAll};