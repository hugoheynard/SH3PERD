import {DateMethod} from "../../Utilities/class_DateMethods.js";

class TimeSplit_Strategy{
    constructor(input){
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.splitArray = [];
    };
}

class UserDuration extends TimeSplit_Strategy{
    constructor(input) {
        super(input);
        this.rotationDuration = input.params.userDuration;
    };
    split() {
        let current = this.startTime;
        while (current < this.endTime) {
            this.splitArray.push(
                {
                    startTime: current,
                    duration: this.rotationDuration
                }
            );
            current = DateMethod.addMinutes(current, this.rotationDuration);
        }
        return this.splitArray;
    };
}

class TimePattern extends TimeSplit_Strategy{
    constructor(input) {
        super(input);
        this.pattern = input.params.pattern;
    };
    split() {
        let current = this.startTime;
        let index = 0;

        while (current < this.endTime) {
            const duration = this.pattern[index % this.pattern.length]
            this.splitArray.push(
                {
                    startTime: current,
                    duration: duration
                }
            );
            current = DateMethod.addMinutes(current, duration);
            index++
        }
        return this.splitArray;
    };
}

export {UserDuration, TimePattern}