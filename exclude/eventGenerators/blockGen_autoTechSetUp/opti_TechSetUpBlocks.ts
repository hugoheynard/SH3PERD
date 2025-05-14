

//TODO : refaire l'opti de tech set up pour la gestion du temps

import {sortEventsArrayPerAscendingTime} from "../../../packages/calendar/src/utils/sortEventsArrayPerAscendingTime.js";
import type {TEventUnitDomainModel} from "@sh3pherd/shared-types";
import {addMinutes} from "../../../packages/calendar/src/utils/dateFunctions/date_functions.js";

export const optimiseTechSetupBlocks = (blockList: TEventUnitDomainModel[]): TEventUnitDomainModel => {
    /*
    * Reorganises the blocks to merge the tasks
    * 1 -> sort array per ascending Time
    * 2 -> get the earliest block to get the earliest startTime to decrement from
    * 3 -> concat all descriptions by ascending timing order (most urgent first)
    */

    const ascendingArray: TEventUnitDomainModel[] = sortEventsArrayPerAscendingTime(blockList);

    const earliestBlockStartTime: Date = ascendingArray[0].startDate;
    let totalDuration: number = 0;
    let startTime;
    let allDescription: any[] = [];

    ascendingArray.forEach((block: any) => {

        totalDuration += block.duration;
        allDescription = allDescription.concat(block.content.description);
        startTime = addMinutes(earliestBlockStartTime, block.duration);

    })


    return{
            startDate: startTime,
            endDate: addMinutes(startTime, totalDuration),
            staff: [],
            content: {
                title: "techSetUp",
                description: allDescription
            },
            generated: true
        }
}

