import { DateMethod } from "../../../utilities/DateHelperFunctions.js";
import { TimeSplit_Strategy } from "./class_TimeSplit_Strategy.js";
export class DefaultOneBlock extends TimeSplit_Strategy {
    rotationDuration;
    constructor(input) {
        super(input);
        this.rotationDuration = DateMethod.differenceInMinutes(this.startTime, this.endTime);
        this.split();
    }
    ;
    split() {
        let current = this.startTime;
        while (current < this.endTime) {
            this.timeSlots.push({
                startTime: current,
                duration: this.rotationDuration
            });
            current = DateMethod.addMinutes(current, this.rotationDuration);
        }
        return this.timeSlots;
    }
    ;
}
//# sourceMappingURL=class_Strategy_DefaultOneBlock.js.map