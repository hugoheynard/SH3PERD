export class TimeSplit_Interface {
    startTime;
    endTime;
    strategy;
    constructor(input) {
        this.startTime = input.startTime;
        this.endTime = input.endTime;
    }
    ;
    setStrategy(input) {
        this.strategy = new input.strategy({
            startTime: this.startTime,
            endTime: this.endTime,
            params: input.params
        });
        this.split();
    }
    ;
    split() {
        return this.strategy.split();
    }
    ;
}
//# sourceMappingURL=class_TimeSplit_Interface.js.map