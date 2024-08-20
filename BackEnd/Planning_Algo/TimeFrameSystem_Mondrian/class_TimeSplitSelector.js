import {UserDuration} from "./class_TimeSplit_Strategy.js";


class TimeSplitSelector{
    constructor(string) {
        this.string = string
        this.selector = {
            'userDuration': UserDuration
        };
        return this.selector[this.string]
    };
}

export {TimeSplitSelector};