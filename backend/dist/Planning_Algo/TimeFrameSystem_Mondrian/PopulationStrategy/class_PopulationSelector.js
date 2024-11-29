import { DefaultNoStaff } from "./class_Strategy_DefaultNoStaff.js";
import { LinearPopulation } from "./class_Strategy_LinearPopulation.js";
import { BestFit_GraphAnalytics } from "./class_Strategy_BestFit_GraphAnalytics.js";
export class PopulationSelector {
    string;
    selector;
    constructor(string) {
        this.string = string;
        this.selector = {
            'defaultNoStaff': DefaultNoStaff,
            'linearPopulation': LinearPopulation,
            'bestFit_graphAnalytics': BestFit_GraphAnalytics
        };
        return this.selector[this.string];
    }
    ;
}
//# sourceMappingURL=class_PopulationSelector.js.map