import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";

class Show extends Activity {

    constructor(date, duration = 15, staffArray, category) {

        super(date, duration, staffArray, category);

        this.type = "show";
        this.location = location;
        this.staff = staffArray;
        this.id = this.idFromArray([this.date, this.type, this.location]);
        this.category = category;


    };
}

export{Show};