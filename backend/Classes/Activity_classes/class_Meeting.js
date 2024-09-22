import {Activity} from "./class_Activity.js";

class Meeting extends Activity {

    constructor(input) {
        super(input);
        this.type = "meeting";
    };
}

export{Meeting};