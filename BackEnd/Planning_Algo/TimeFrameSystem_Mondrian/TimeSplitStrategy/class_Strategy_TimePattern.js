import {DateMethod} from "../../../Utilities/class_DateMethods.js";
import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy.js";

class TimePattern extends TimeSplit_Strategy{
    constructor(input) {
        super(input);
        this.pattern = input.params.pattern;
    };
    split() {
        let current = this.startTime;
        let index = 0;

        while (current < this.endTime) {
            const duration = this.pattern[index % this.pattern.length]
            this.timeSlots.push(
                {
                    startTime: current,
                    duration: duration
                }
            );
            current = DateMethod.addMinutes(current, duration);
            index++
        }
        return this.timeSlots;
    };
}

export {TimePattern};