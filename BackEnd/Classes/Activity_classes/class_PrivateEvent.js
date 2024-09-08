import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";


class PrivateEvent extends Activity {
    constructor(input) {

        super(input);
        this.type = "private";
        this.category = input.category;
        this.location = input.location;
        //this.id = this.idFromArray([this.date, this.type, this.category, this.location]);

    };

}

export {PrivateEvent};