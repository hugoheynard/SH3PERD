import {TimeframeContext} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_TimeframeContext.js";
import {LinearPopulation} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_PopulationStrategy.js";
import {TimeSplitSelector} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_TimeSplitSelector.js";


/*The rotation must find the best fit in candidates*/


const test = new TimeframeContext(
    {
        timeframeTitle: 'lunchCabaret',
        startTime: new Date(2024, 11, 19, 12, 0),
        endTime: new Date(2024, 11, 19, 15, 0),
        staffCategory: 'dj',
    })
test.setSplitStrategy(
    {
        strategy: new TimeSplitSelector('userDuration'),
        params: {
            userDuration: 60
        }

    })

test.setPopulationStrategy(
    {
        strategy: LinearPopulation,
        params: {
            offset: 0
            //minmax staff
        }
    })



test.preview()



const testFrameGenBlock = test.generatedBlocks



class StaffPopulator {
    constructor(input) {
        this.timeframe = input.timeframe;
    };

}


const noSuccessiveWorkBlocks = (array) => {

}

const randomPick = (array) => {
    return Math.floor(Math.random() * array.length)
};




class Auto_Club{
    constructor(input) {
        this.startTime = input.startTime;

    };
}

export {Auto_Club, testFrameGenBlock};