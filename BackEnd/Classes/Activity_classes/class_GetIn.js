import {Activity} from "./class_Activity.js";
import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";


class GetIn extends Activity {

    constructor(date, duration = 5, [startTime_hours, startTime_minutes], membersArray, blockOrigin = "generatedBlock") {

        super(date, duration, [startTime_hours, startTime_minutes], membersArray);

        this.type = "getIn";
        this.blockOrigin = blockOrigin;
        this.id = generateIdFromArray([this.date, this.startTime, this.type, this.blockOrigin, this.staff[0].staffMember_id]);

    };
}

export{GetIn};