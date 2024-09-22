import {PopulationStrategy} from "./class_PopulationStrategy.js";


class LinearPopulation extends PopulationStrategy{

    constructor(input) {
        super(input);
        this._offset = this.params.offset;
        this._staffMax = this.params.staffMax;
        this._reverse = this.params.reverse;
    };
    get offset() {
        return this._offset;
    };
    get staffMax() {
        return this._staffMax;
    };
    get reverse() {
        return this._reverse;
    };
    getCandidate(index) {
        const regularIndex = (index + this.offset) % this.staff.length

        if (this.reverse) {
            return [this.staff[(this.staff.length - 1) - regularIndex]];
        }
        return [this.staff[regularIndex]];
    };

    populate() {
        this.timeSlots.forEach((section, index) => {

            section.worker = this.getCandidate(index);
            section.available = this.staff.filter(member => JSON.stringify(member) !== JSON.stringify(...section.worker));
        });
        return this.timeSlots
    };
}

export {LinearPopulation};