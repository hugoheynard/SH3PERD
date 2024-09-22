import {Activity} from "./class_Activity.js";


class Show extends Activity {

    constructor(input) {

        super(input);

        this.type = "show";
        this.location = location;
        this.staff = input.staff;
        //this.id = this.idFromArray([this.date, this.type, this.location]);
        this.category = input.category;


    };
}

export{Show};