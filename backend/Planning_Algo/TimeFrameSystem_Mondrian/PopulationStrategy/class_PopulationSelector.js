import {LinearPopulation} from "./class_Strategy_LinearPopulation.js";
import {BestFit_GraphAnalytics} from "./class_Strategy_BestFit_GraphAnalytics.js";
import {DefaultNoStaff} from "./class_Strategy_DefaultNoStaff.js";


class PopulationSelector{
    constructor(string) {
        this.string = string
        this.selector = {
            'defaultNoStaff': DefaultNoStaff,
            'linearPopulation': LinearPopulation,
            'bestFit_graphAnalytics': BestFit_GraphAnalytics
        };
        return this.selector[this.string]
    };
}

export {PopulationSelector};