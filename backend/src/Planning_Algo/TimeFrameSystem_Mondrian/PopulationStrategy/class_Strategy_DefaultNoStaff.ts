


//Used as default strategy when creating a new TimeFrameContext
import {PopulationStrategy} from "./class_PopulationStrategy";

export class DefaultNoStaff extends PopulationStrategy{
    constructor(input: any) {
        super(input);
        this.populate()
    };
    populate(): any {
        this.timeSlots.map((section: any) => {
            section.worker = [];
            section.available = this.staff;
        });
        return this.timeSlots
    };
}
