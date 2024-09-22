import {Blocks} from "./class_Block.js";

class Block_endRow extends Blocks {

    constructor(id, type, duration = 5, [startTime_hours, startTime_minutes], membersArray) {

        super(id, type, duration, [startTime_hours, startTime_minutes], membersArray);

        this.cssClass = "dp_endRow";

    };

}

export{Block_endRow};