import {Activity} from "./class_Activity.js";
import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";


class GetIn extends Activity {

    constructor(date, duration = 5, membersArray, blockOrigin = "generatedBlock") {

        super(date, duration, membersArray);

        this.type = "getIn";
        this.blockOrigin = blockOrigin;
        this.id = generateIdFromArray([this.date, this.type, this.blockOrigin, this.staff[0].staffMember_id]);

    };
}

export{GetIn};