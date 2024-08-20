import {Activity} from "./class_Activity.js";

class Rehearsal extends Activity {

    constructor(input) {
        super(input);

        this.type = "rehearsal";
        this.location = input.location;
        this.id = this.idFromArray([this.date, this.type, this.location]);
        this.needsTechInstall = input.needsTechInstall;
        this.needsTechAssist = input.needsTechAssist;

    };
}

export{Rehearsal};