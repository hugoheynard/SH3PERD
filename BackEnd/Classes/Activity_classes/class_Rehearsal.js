import {Activity} from "./class_Activity.js";
import {getActiveStaffPool} from "../../Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";

class Rehearsal extends Activity {

    constructor(date, duration = 5, staffArray, location, needsTechInstall, needsTechAssist) {

        super(date, duration, staffArray);

        this.type = "rehearsal";
        this.location = location;
        this.id = this.idFromArray([this.date, this.type, this.location]);
        this.needsTechInstall = needsTechInstall;
        this.needsTechAssist = needsTechAssist;

    };
}

export{Rehearsal};