import {Activity} from "./class_Activity.js";

class Void extends Activity {

    constructor(input) {
        super(input);
        this.type = "void";
        this.workingMembers = [];
    };
}

export{Void};