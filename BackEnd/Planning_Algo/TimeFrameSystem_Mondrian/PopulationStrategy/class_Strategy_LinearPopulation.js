import {PopulationStrategy} from "./class_PopulationStrategy.js";


class LinearPopulation extends PopulationStrategy{
    constructor(input) {
        super(input);
        this.offset = this.params.offset;
        this.staffMax = this.params.staffMax;
    };

    populate() {
        const availablePeople = [...this.staff]
        const assignedPeople = [];

        this.timeSlots.forEach((section, index) => {

            const candidate = [this.staff[(index + this.offset) % this.staff.length]]

            section.worker = candidate;
            section.available = this.staff.filter(member => JSON.stringify(member) !== JSON.stringify(...section.worker));
        });
        return this.timeSlots
    };
}

export {LinearPopulation};