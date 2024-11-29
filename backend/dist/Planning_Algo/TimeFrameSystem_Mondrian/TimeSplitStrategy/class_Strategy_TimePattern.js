import { TimeSplit_Strategy } from "./class_TimeSplit_Strategy.js";
import { addMinutes } from "../../../utilities/dateFunctions/date_functions.js";
export class TimePattern extends TimeSplit_Strategy {
    pattern;
    constructor(input) {
        super(input);
        this.pattern = input.params.pattern;
    }
    ;
    split() {
        let current = this.startTime;
        let index = 0;
        while (current < this.endTime) {
            const duration = this.pattern[index % this.pattern.length];
            this.timeSlots.push({
                startTime: current,
                duration: duration
            });
            current = addMinutes(current, duration);
            index++;
        }
        return this.timeSlots;
    }
    ;
}
//# sourceMappingURL=class_Strategy_TimePattern.js.map