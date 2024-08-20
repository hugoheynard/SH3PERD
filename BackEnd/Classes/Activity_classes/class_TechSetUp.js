import {Activity} from "./class_Activity.js";
import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";

class TechSetUp extends Activity {

    constructor(input) {

        super(input);

        this.type = "techSetUp";
        this.blockOrigin = input.blockOrigin ?? "userEntry";
        this.id = generateIdFromArray([this.date, this.type, this.blockOrigin]);
        this.content = input.content;


    };
}

export{TechSetUp};