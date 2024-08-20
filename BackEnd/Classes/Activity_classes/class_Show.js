import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";

class Show extends Activity {

    constructor(input) {

        super(input);

        this.type = "show";
        this.location = location;
        this.staff = input.staff;
        this.id = this.idFromArray([this.date, this.type, this.location]);
        this.category = input.category;


    };
}

export{Show};