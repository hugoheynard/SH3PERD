import {Activity} from "./class_Activity.js";
import {generateIdFromArray} from "../../Utilities/generateIdFromArray.js";


class GetIn extends Activity {

    constructor(input) {

        super(input);

        this.type = "getIn";
        this.blockOrigin = "generatedBlock";
        this.id = generateIdFromArray([this.date, this.type, this.blockOrigin, this.staff[0].staffMember_id]);

    };
}

export{GetIn};