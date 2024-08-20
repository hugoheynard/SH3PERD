import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";
import {STEP_DURATION} from "../../../Front/Utilities/MAGIC NUMBERS.js";

class Activity {
    constructor(input) {
        this.date = input.date;
        this.type = input.type;
        this.duration = input.duration ?? STEP_DURATION;
        this.staff = input.staff;
    };

    idFromArray(array) {
        return generateIdFromArray(array)
    };
}

export {Activity};