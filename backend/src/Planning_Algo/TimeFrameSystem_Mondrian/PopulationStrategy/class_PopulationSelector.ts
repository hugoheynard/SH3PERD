import {DefaultNoStaff} from "./class_Strategy_DefaultNoStaff";
import {LinearPopulation} from "./class_Strategy_LinearPopulation";
import {BestFit_GraphAnalytics} from "./class_Strategy_BestFit_GraphAnalytics";


export class PopulationSelector{
    string: string;
    selector: { [key: string]: any };

    constructor(string: any) {
        this.string = string
        this.selector = {
            'defaultNoStaff': DefaultNoStaff,
            'linearPopulation': LinearPopulation,
            'bestFit_graphAnalytics': BestFit_GraphAnalytics
        };
        return this.selector[this.string]
    };
}
