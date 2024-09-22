import {Activity} from "./class_Activity.js";

class TechSetUp extends Activity {

    constructor(input) {

        super(input);

        this.type = "techSetUp";
        this.blockOrigin = input.blockOrigin ?? "userEntry";
        this.content = input.content;


    };
}

export{TechSetUp};