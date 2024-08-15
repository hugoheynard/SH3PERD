import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";


class PrivateEvent extends Activity {
    constructor(date, duration, staffArray, content, category, location) {

        super(date, duration, staffArray);
        this.type = "private";
        this.category = category;
        this.location = location;
        this.id = this.idFromArray([this.date, this.type, this.category, this.location]);

    };

}

export {PrivateEvent};