import {UserDuration} from "./class_Strategy_UserDuration.ts";
import {TimePattern} from "./class_Strategy_TimePattern.ts";
import {DefaultOneBlock} from "./class_Strategy_DefaultOneBlock.ts";


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