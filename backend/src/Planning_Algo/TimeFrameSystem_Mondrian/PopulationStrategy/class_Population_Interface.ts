export class Population_Interface {
    staff: any;
    strategy: any;

    constructor(input: any){
        this.staff = input.staff;
    };
    setStrategy(input: any): void {
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
