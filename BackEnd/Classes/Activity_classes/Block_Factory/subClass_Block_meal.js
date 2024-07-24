import {Blocks} from "./class_Block.js";

class Block_meal extends Blocks {

    constructor(id, duration = 5, [startTime_hours, startTime_minutes], membersArray) {

        super(id, duration, [startTime_hours, startTime_minutes], membersArray);

        this.cssClass = "dp_meal";
        this.type = "meal";

    };

}

export{Block_meal};