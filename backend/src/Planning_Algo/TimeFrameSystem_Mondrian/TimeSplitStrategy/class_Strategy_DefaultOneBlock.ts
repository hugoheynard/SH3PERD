import {DateMethod} from "../../../utilities/DateHelperFunctions";
import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy";

export class DefaultOneBlock extends TimeSplit_Strategy{
    private rotationDuration: any
    constructor(input: any) {
        super(input);
        this.rotationDuration = DateMethod.differenceInMinutes(this.startTime, this.endTime);
        this.split();
    };
    split(): any {
        let current: Date = this.startTime;
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
