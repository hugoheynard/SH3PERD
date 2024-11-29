import { DefaultOneBlock } from "./class_Strategy_DefaultOneBlock.js";
import { UserDuration } from "./class_Strategy_UserDuration.js";
import { TimePattern } from "./class_Strategy_TimePattern.js";
export class TimeSplitSelector {
    string;
    selector;
    constructor(string) {
        this.string = string;
        this.selector = {
            'defaultOneBlock': DefaultOneBlock,
            'userDuration': UserDuration,
            'timePattern': TimePattern
        };
        return this.selector[this.string];
    }
    ;
}
//# sourceMappingURL=class_TimeSplitSelector.js.map