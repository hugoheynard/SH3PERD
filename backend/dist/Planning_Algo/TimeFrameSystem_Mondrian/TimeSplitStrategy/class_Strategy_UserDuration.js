import { TimeSplit_Strategy } from "./class_TimeSplit_Strategy.js";
import { addMinutes } from "../../../utilities/dateFunctions/date_functions.js";
export class UserDuration extends TimeSplit_Strategy {
    rotationDuration;
    constructor(input) {
        super(input);
        this.rotationDuration = input.params.userDuration;
    }
    ;
    split() {
        let current = this.startTime;
        while (current < this.endTime) {
            this.timeSlots.push({
                startTime: current,
                duration: this.rotationDuration
            });
            current = addMinutes(current, this.rotationDuration);
        }
        return this.timeSlots;
    }
    ;
}
//# sourceMappingURL=class_Strategy_UserDuration.js.map