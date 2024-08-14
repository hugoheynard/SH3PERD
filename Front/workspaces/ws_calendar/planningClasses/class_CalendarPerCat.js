import {Calendar} from "./class_Calendar.js";


class CalendarPerCat extends Calendar {
    constructor(timeTable, staffList, baseIndex) {
        super(timeTable, staffList, baseIndex = 0);
    };
    listGranularity(staffList) {
        /*ITERATES TO CREATE THE RIGHT AMOUNT OF SUB ARRAYS (1 PER CAT)
        * THE INDEX OF THE CAT IN THE CAT ARRAY DEFINES WHERE TO PUT THE STAFF MEMBER IN THE MATRIX SUB ARRAYS */
        const matrixList = [];
        const catList = [];

        for (const staff of staffList) {

            if (!catList.includes(staff.category)) {
                catList.push(staff.category);
                matrixList.push([]);
            }

            matrixList[catList.indexOf(staff.category)].push(staff);
        }
        return matrixList;
    };
}

export{CalendarPerCat};