import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";

class Show extends Activity {

    constructor(date, duration = 15, [startTime_hours, startTime_minutes], staffArray, category) {

        super(date, duration, [startTime_hours, startTime_minutes], staffArray, category);

        this.type = "show";
        this.location = location;
        this.staff = staffArray;
        this.id = this.idFromArray([this.date, ...this.startTime, this.type, this.location]);
        this.category = category;


    };
}

export{Show};