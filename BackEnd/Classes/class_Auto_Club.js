import {TimeframeContext} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_TimeframeContext.js";
import {LinearPopulation} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_PopulationStrategy.js";
import {TimeSplitSelector} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_TimeSplitSelector.js";
import {PopulationSelector} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_PopulationSelector.js";
import {artistMockupDB} from "../../db/fakeDB.js";


/*The rotation must find the best fit in candidates*/


const test = new TimeframeContext(
    {
        timeframeTitle: 'lunchCabaret',
        startTime: new Date(2024, 11, 19, 12, 0),
        endTime: new Date(2024, 11, 19, 15, 0),
        staff: artistMockupDB.filter(member => member.category === 'dj'),
    })

test.setSplitStrategy(

    {
        strategy: new TimeSplitSelector('userDuration'),
        params: {
            userDuration: 30
        }

    }
)


test.setPopulationStrategy(
    {
        strategy: new PopulationSelector('linearPopulation'),
        params: {
            offset: 0,
            staffMax: 2
        }
    }
)

test.setSplitStrategy(
    {
        strategy: new TimeSplitSelector('timePattern'),
        params: {
            pattern: [45, 15],
        }
    }
)



//test.preview()



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