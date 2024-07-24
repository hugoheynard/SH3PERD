import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";

class Activity {
    constructor(date, duration, [startTime_hours, startTime_minutes], staffArray) {

        this.date = date;
        this.duration = duration;
        this.startTime = [startTime_hours, startTime_minutes];
        this.staff = staffArray;
    }

    idFromArray(array) {

        return generateIdFromArray(array)

    };


}

export {Activity};