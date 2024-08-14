import {Calendar} from "./class_Calendar.js";


class CalendarIndiv extends Calendar{
    constructor(timeTable, staffList, baseIndex) {
        super(timeTable, staffList, baseIndex = 0);
    };

    listGranularity(staffList) {
        const matrixList = [];

        for (const staff of staffList) {
            matrixList.push( [staff] );
        }

        return matrixList;
    };

}

export {CalendarIndiv};