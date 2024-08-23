import {DefaultNoStaff} from "./class_Strategy_DefaultNoStaff.js";


class Population_Interface {
    constructor(input){
        this.staff = input.staff;
        this.timeSlots = input.timeSlots;
        this.strategy = new DefaultNoStaff(
            {
                staff: this.staff,
                timeSlots: this.timeSlots
            });
    };
    setStrategy(input) {
        this.strategy = new input.strategy(
            {
                staff: this.staff,
                timeSlots: this.timeSlots,
                params: input.params
            });
        this.populate();
    };
    populate() {
        return this.strategy.populate();
    };
}

export {Population_Interface};