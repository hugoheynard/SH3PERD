export class TimeSplit_Interface {
    startTime: Date;
    endTime: Date;
    strategy: any;
    constructor(input: any){
        this.startTime = input.startTime;
        this.endTime = input.endTime;
    };
    setStrategy(input: any): void {
        this.strategy = new input.strategy(
            {
                startTime: this.startTime,
                endTime: this.endTime,
                params: input.params
            });
        this.split();
    };
    split() {
        return this.strategy.split();
    };
}
