import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";
import {art1} from "../../../db/fakeDB.js";

class Meeting extends Activity {

    constructor(date, duration = 5, [startTime_hours, startTime_minutes], staffArray) {

        super(date, duration, [startTime_hours, startTime_minutes], staffArray);

        this.type = "meeting";

    };
}

export{Meeting};