import {DefaultOneBlock} from "./class_Strategy_DefaultOneBlock.js";


class TimeSplit_Interface {
    constructor(input){
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.strategy = new DefaultOneBlock({startTime: this.startTime, endTime: this.endTime});
    };
    setStrategy(input) {
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

export {TimeSplit_Interface};