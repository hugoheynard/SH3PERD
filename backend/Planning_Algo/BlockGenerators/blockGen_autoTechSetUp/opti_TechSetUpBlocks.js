import {sortBlockArrayPerTime} from "../../../Utilities/sortBlockArray.js";
import {TechSetUp} from "../../../Classes/Activity_classes/class_TechSetUp.js";
import {art1} from "../../../../db/fakeDB.js";
import {DateMethod} from "../../../Utilities/class_DateMethods.js";

//TODO : refaire l'opti de tech set up pour la gestion du temps
const optimiseTechSetupBlocks = blockList => {
    /*
    * Reorganises the blocks to merge the tasks
    * 1 -> sort array per ascending Time
    * 2 -> get the earliest block to get the earliest startTime to decrement from
    * 3 -> concat all descriptions by ascending timing order (most urgent first)
    */

    const ascendingArray = sortBlockArrayPerTime(blockList);

    const earliestBlockStartTime = ascendingArray[0].date;
    const date = ascendingArray[0].date;
    let totalDuration = 0;
    let startTime;
    let allDescription = [];

    ascendingArray.forEach(block => {

        totalDuration += block.duration;
        allDescription = allDescription.concat(block.content.description);
        startTime = DateMethod.addMinutes(earliestBlockStartTime, block.duration);

    })


    return [
        new TechSetUp(
        {
            date: startTime,
            duration: totalDuration,
            staff: [art1],
            content: {
                title: "techSetUp",
                description: allDescription
            },
            blockOrigin: "generatedBlock"
        })
    ]

}

export {optimiseTechSetupBlocks};