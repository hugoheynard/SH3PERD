import {Activity} from "./class_Activity.js";
import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";

class TechSetUp extends Activity {

    constructor(date, duration = 15, membersArray, content = {}, blockOrigin = "userEntry") {

        super(date, duration, membersArray);

        this.type = "techSetUp";
        this.blockOrigin = blockOrigin;
        this.id = generateIdFromArray([this.date, this.type, this.blockOrigin]);
        this.content = content;


    };
}

export{TechSetUp};