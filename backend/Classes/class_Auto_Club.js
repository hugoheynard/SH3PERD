import {TimeframeContext} from "../Planning_Algo/TimeFrameSystem_Mondrian/class_TimeframeContext.js";

try {
    const test = new TimeframeContext(
        {
            timeframeTitle: 'lunchCabaret',
            startTime: new Date(2024, 11, 19, 15, 0),
            endTime: new Date(2024, 11, 19, 19, 0),
            //staff: artistMockupDB.filter(member => member.category === 'dj'),
        })

    test.setTimeSplitStrategy(
        {
            strategy: 'userDuration',
            params: {
                userDuration: 30
            }
        }
    )

    test.setPopulationStrategy(
        {
            strategy: 'linearPopulation',
            params: {
                reverse: false,
                offset: 0,
                staffMax: 2
            }
        }
    )

    /*
    test.setPopulationStrategy(
        {
            strategy: 'bestFit_graphAnalytics',
            params: {
                //staffMax: 2
            }
        }
    )
    */

    /*
    test.setTimeSplitStrategy(
        {
            strategy: 'timePattern',
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

} catch (e) {

}
/*The rotation must find the best fit in candidates*/


