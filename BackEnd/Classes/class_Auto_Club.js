import {TimeframeContext} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_TimeframeContext.js";
import {TimeSplitSelector} from "../Planning_Algo/TimeFrameSystem_Mondrian/TimeSplitStrategy/class_TimeSplitSelector.js";
import {PopulationSelector} from "../Planning_Algo/TimeFrameSystem_Mondrian/PopulationStrategy/class_PopulationSelector.js";
import {art1, artistMockupDB} from "../../db/fakeDB.js";


/*The rotation must find the best fit in candidates*/
const test = new TimeframeContext(
    {
        timeframeTitle: 'lunchCabaret',
        startTime: new Date(2024, 11, 19, 15, 0),
        endTime: new Date(2024, 11, 19, 19, 0),
        staff: artistMockupDB.filter(member => member.category === 'dj'),
    })

test.timeSplit.setStrategy(
    {
        strategy: new TimeSplitSelector('userDuration'),
        params: {
            userDuration: 30
        }
    }
)
/*
test.population.setStrategy(
    {
        strategy: new PopulationSelector('linearPopulation'),
        params: {
            offset: 0,
            staffMax: 2
        }
    }
)
*/

test.population.setStrategy(
    {
        strategy: new PopulationSelector('bestFit_graphAnalytics'),
        params: {
            //staffMax: 2
        }
    }
)

/*
test.timeSplit.setStrategy(
    {
        strategy: new TimeSplitSelector('timePattern'),
        params: {
            pattern: [45, 15],
        }
    }
)
*/




test.preview()




const testFrameGenBlock = test.generatedBlocks







const randomPick = (array) => {
    return Math.floor(Math.random() * array.length)
};




class Auto_Club{
    constructor(input) {
        this.startTime = input.startTime;

    };
}

export {Auto_Club, testFrameGenBlock};