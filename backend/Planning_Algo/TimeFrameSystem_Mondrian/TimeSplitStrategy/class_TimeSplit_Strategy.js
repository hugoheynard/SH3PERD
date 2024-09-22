import {DateMethod} from "../../../Utilities/class_DateMethods.js";

class TimeSplit_Strategy{
    constructor(input){
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.timeSlots = [];
    };
}

export {TimeSplit_Strategy};