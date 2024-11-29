import {DefaultOneBlock} from "./class_Strategy_DefaultOneBlock";
import {UserDuration} from "./class_Strategy_UserDuration";
import {TimePattern} from "./class_Strategy_TimePattern";

export class TimeSplitSelector {
    string: string;
    selector: string;

    constructor(string: string) {
        this.string = string
        this.selector = {
            'defaultOneBlock': DefaultOneBlock,
            'userDuration': UserDuration,
            'timePattern': TimePattern
        };
        return this.selector[this.string]
    };
}
