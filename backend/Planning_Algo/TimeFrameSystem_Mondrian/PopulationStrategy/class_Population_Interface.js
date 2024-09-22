class Population_Interface {
    constructor(input){
        this.staff = input.staff;
    };
    setStrategy(input) {
        this.strategy = new input.strategy(
            {
                staff: this.staff,
                timeSlots: input.timeSlots,
                params: input.params
            });
    };
    populate() {
        return this.strategy.populate();
    };
}

export {Population_Interface};