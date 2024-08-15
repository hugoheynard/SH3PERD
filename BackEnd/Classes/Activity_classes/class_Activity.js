import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";
import {STEP_DURATION} from "../../../Front/Utilities/MAGIC NUMBERS.js";

class Activity {
    constructor(date, duration, staffArray) {

        this.date = date;
        this.duration = duration ?? STEP_DURATION;
        this.staff = staffArray;
    }

    idFromArray(array) {
        return generateIdFromArray(array)
    };
}

export {Activity};