import {DateMethod} from "../../Utilities/class_DateMethods.js";

class TimeSplit_Strategy{
    constructor(input){
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.timeframeDuration = DateMethod.differenceInMinutes(this.startTime, this.endTime);
        this.splitArray = [];
    };
}

class UserDuration extends TimeSplit_Strategy{
    constructor(input) {
        super(input);
        this.rotationDuration = input.params.userDuration;
        this.split();
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
    };
}

export {UserDuration}