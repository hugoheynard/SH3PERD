export class Population_Interface {
    staff;
    strategy;
    constructor(input) {
        this.staff = input.staff;
    }
    ;
    setStrategy(input) {
        this.strategy = new input.strategy({
            staff: this.staff,
            timeSlots: input.timeSlots,
            params: input.params
        });
    }
    ;
    populate() {
        return this.strategy.populate();
    }
    ;
}
//# sourceMappingURL=class_Population_Interface.js.map