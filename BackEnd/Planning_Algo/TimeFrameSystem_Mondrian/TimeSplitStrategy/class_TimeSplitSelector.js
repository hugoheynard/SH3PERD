import {UserDuration} from "./class_Strategy_UserDuration.js";
import {TimePattern} from "./class_Strategy_TimePattern.js";
import {DefaultOneBlock} from "./class_Strategy_DefaultOneBlock.js";


class TimeSplitSelector{
    constructor(string) {
        this.string = string
        this.selector = {
            'defaultOneBlock': DefaultOneBlock,
            'userDuration': UserDuration,
            'timePattern': TimePattern
        };
        return this.selector[this.string]
    };
}

export {TimeSplitSelector};