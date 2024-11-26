import {LinearPopulation} from "./class_Strategy_LinearPopulation";
import {BestFit_GraphAnalytics} from "./class_Strategy_BestFit_GraphAnalytics";
import {DefaultNoStaff} from "./class_Strategy_DefaultNoStaff";


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