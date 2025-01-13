import {DefaultOneBlock} from "./class_Strategy_DefaultOneBlock";
import {UserDuration} from "./UserDuration";
import {TimePattern} from "./TimePattern";

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
