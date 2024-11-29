import {PopulationStrategy} from "./class_PopulationStrategy";


export class LinearPopulation extends PopulationStrategy{
    _offset: any;
    _staffMax: any;
    _reverse: any;

    constructor(input: any) {
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
    getCandidate(index: number): [any] {
        const regularIndex: number = (index + this.offset) % this.staff.length

        if (this.reverse) {
            return [this.staff[(this.staff.length - 1) - regularIndex]];
        }
        return [this.staff[regularIndex]];
    };

    populate(): any {
        this.timeSlots.forEach((section: any, index: number):void => {

            section.worker = this.getCandidate(index);
            section.available = this.staff.filter((member: any) => JSON.stringify(member) !== JSON.stringify(...section.worker));
        });
        return this.timeSlots
    };
}
