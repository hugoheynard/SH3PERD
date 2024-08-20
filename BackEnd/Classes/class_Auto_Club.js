import {DateMethod} from "../Utilities/class_DateMethods.js";


/*The rotation must find the best fit in candidates*/
class TimeframeContext{
    /*Creates a time canvas, instantiating time sections according to a split rule*/
    constructor(input) {
        this.timeframeTitle = input.timeframeTitle;
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.staffCategory = input.staffCategory;
        this.timeSplitStrategy = input.timeSplitStrategy;

    };

    setStrategy(newTimeSplit) {
        this.timeSplitStrategy = newTimeSplit;
    };

    getSectionsFromTimeSplitStrategy() {

        this.timeSplitStrategy.splitArray.forEach(item => {

        })

        return this.timeSplitStrategy.splitArray
    }

}

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
            this.rotationDuration = input.userDuration;
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

const test = new TimeframeContext(
    {
        timeframeTitle: 'lunchCabaret',
        startTime: new Date(2024, 11, 19, 12, 0),
        endTime: new Date(2024, 11, 19, 15, 0),
        staffCategory: 'dj',
        timeSplitStrategy: new UserDuration(
            {
                startTime: new Date(2024, 11, 19, 12, 0),
                endTime: new Date(2024, 11, 19, 15, 0),
                userDuration: 60
            })
    })







class Auto_Club{
    constructor(input) {
        this.startTime = input.startTime;

    };
}

export {Auto_Club};