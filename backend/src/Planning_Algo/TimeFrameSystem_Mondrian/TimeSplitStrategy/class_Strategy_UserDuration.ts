import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy";
import {addMinutes} from "../../../utilities/dateFunctions/date_functions";

export class UserDuration extends TimeSplit_Strategy{
    rotationDuration: number;

    constructor(input: any) {
        super(input);
        this.rotationDuration = input.params.userDuration;
    };
    split() {
        let current: Date = this.startTime;
        while (current < this.endTime) {
            this.timeSlots.push(
                {
                    startTime: current,
                    duration: this.rotationDuration
                }
            );
            current = addMinutes(current, this.rotationDuration);
        }
        return this.timeSlots;
    };
}