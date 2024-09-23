import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";
import {DateMethod} from "../../Utilities/class_DateMethods.js";


class Activity {
    constructor(input) {
        //this.id= genID();
        this.date = input.date;
        this.type = input.type;
        this.duration = input.duration ?? DateMethod.STEP_DURATION;
        this.staff = input.staff;
    };

    idFromArray(array) {
        return generateIdFromArray(array)
    };
}

export {Activity};