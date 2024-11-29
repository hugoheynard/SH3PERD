import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy";
import {addMinutes} from "../../../utilities/dateFunctions/date_functions";


export class TimePattern extends TimeSplit_Strategy{
    pattern: any

    constructor(input: any) {
        super(input);
        this.pattern = input.params.pattern;
    };
    split() {
        let current: Date = this.startTime;
        let index: number = 0;

        while (current < this.endTime) {
            const duration = this.pattern[index % this.pattern.length]
            this.timeSlots.push(
                {
                    startTime: current,
                    duration: duration
                }
            );
            current = addMinutes(current, duration);
            index++
        }
        return this.timeSlots;
    };
}

