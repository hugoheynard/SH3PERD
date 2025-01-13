import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy";
import {addMinutes} from "../../../utilities/dateFunctions/date_functions";
import type {TimeSlot} from "../interfaces/TimeframeSystem_interfaces";


export class TimePattern extends TimeSplit_Strategy{
    private readonly pattern: number[];

    constructor(input: any) {
        super(input);
        this.pattern = input.params.pattern;
    };

    split(): TimeSlot[] {
        let current: Date = this.startTime;
        let index: number = 0;

        while (current < this.endTime) {
            const duration: number = this.pattern[index % this.pattern.length];

            this.timeSlots.push(
                {
                    startTime: current,
                    duration: duration
                }
            );

            current = addMinutes(current, duration);
            index++;
        }
        return this.timeSlots;
    };
}