import {DateMethod} from "../../../Utilities/class_DateMethods.js";
import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy.js";

class DefaultOneBlock extends TimeSplit_Strategy{
    constructor(input) {
        super(input);
        this.rotationDuration = DateMethod.differenceInMinutes(this.startTime, this.endTime);
        this.split();
    };
    split() {
        let current = this.startTime;
        while (current < this.endTime) {
            this.timeSlots.push(
                {
                    startTime: current,
                    duration: this.rotationDuration
                }
            );
            current = DateMethod.addMinutes(current, this.rotationDuration);
        }
        return this.timeSlots;
    };
}

export {DefaultOneBlock};