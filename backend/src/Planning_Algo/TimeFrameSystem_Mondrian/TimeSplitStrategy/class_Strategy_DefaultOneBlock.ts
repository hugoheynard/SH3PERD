import {DateMethod} from "../../../utilities/DateHelperFunctions";
import {TimeSplit_Strategy} from "./class_TimeSplit_Strategy";
import {addMinutes} from "../../../utilities/dateFunctions/date_functions";

export class DefaultOneBlock extends TimeSplit_Strategy{
    private readonly rotationDuration: Date | number;
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
            current = addMinutes(current, this.rotationDuration);
        }
        return this.timeSlots;
    };
}
