import {Activity} from "./class_Activity.js";
import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";

class TechSetUp extends Activity {

    constructor(date, duration = 15, [startTime_hours, startTime_minutes], membersArray, content = {}, blockOrigin = "userEntry") {

        super(date, duration, [startTime_hours, startTime_minutes], membersArray);

        this.type = "techSetUp";
        this.blockOrigin = blockOrigin;
        this.id = generateIdFromArray([this.date, this.startTime, this.type, this.blockOrigin]);
        this.content = content;


    };
}

export{TechSetUp};