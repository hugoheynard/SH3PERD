import {LinearPopulation} from "./class_PopulationStrategy.js";

class PopulationSelector{
    constructor(string) {
        this.string = string
        this.selector = {
            'linearPopulation': LinearPopulation
        };
        return this.selector[this.string]
    };
}

export {PopulationSelector};