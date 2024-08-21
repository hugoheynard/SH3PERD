import {Activity} from "./class_Activity.js";

class WorkSlot extends Activity {

    constructor(input) {
        super(input);
        this.type = "work";
        this.workingMembers = [];
    };
}

export{WorkSlot};