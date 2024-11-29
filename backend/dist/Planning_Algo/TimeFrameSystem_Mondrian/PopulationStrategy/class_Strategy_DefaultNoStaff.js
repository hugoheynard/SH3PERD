//Used as default strategy when creating a new TimeFrameContext
import { PopulationStrategy } from "./class_PopulationStrategy.js";
export class DefaultNoStaff extends PopulationStrategy {
    constructor(input) {
        super(input);
        this.populate();
    }
    ;
    populate() {
        this.timeSlots.map((section) => {
            section.worker = [];
            section.available = this.staff;
        });
        return this.timeSlots;
    }
    ;
}
//# sourceMappingURL=class_Strategy_DefaultNoStaff.js.map