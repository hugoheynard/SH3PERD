import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";


class PrivateEvent extends Activity {
    constructor(date, duration, [startTime_hours, startTime_minutes], staffArray, content, category, location) {

        super(date, duration, [startTime_hours, startTime_minutes], staffArray);
        this.type = "private";
        this.category = category;
        this.location = location;
        this.id = this.idFromArray([this.date, ...this.startTime, this.type, this.category, this.location]);

    };

}

export {PrivateEvent};