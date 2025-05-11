

//TODO : refaire l'opti de tech set up pour la gestion du temps
import {addMinutes} from "../../../../../../exclude/backend/src/utilities/dateFunctions/date_functions.js";
import type {CalendarEvent} from "../../../../../../exclude/backend/src/planningBlocks/interfaces_events/CalendarEventsObject.js";
import {sortEventsArrayPerAscendingTime} from "../../../../../../exclude/backend/src/utilities/sortEventsArrayPerAscendingTime.js";

export const optimiseTechSetupBlocks = (blockList: CalendarEvent[]): CalendarEvent => {
    /*
    * Reorganises the blocks to merge the tasks
    * 1 -> sort array per ascending Time
    * 2 -> get the earliest block to get the earliest startTime to decrement from
    * 3 -> concat all descriptions by ascending timing order (most urgent first)
    */

    const ascendingArray: CalendarEvent[] = sortEventsArrayPerAscendingTime(blockList);

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

