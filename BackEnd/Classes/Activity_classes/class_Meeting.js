import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";
import {art1} from "../../../db/fakeDB.js";

class Meeting extends Activity {

    constructor(input) {
        super(input);
        this.type = "meeting";
    };
}

export{Meeting};