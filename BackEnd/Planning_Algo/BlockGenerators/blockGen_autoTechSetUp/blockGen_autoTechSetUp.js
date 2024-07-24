import {TechSetUp} from "../../../Classes/Activity_classes/class_TechSetUp.js";
import {art1} from "../../../../db/fakeDB.js";
import {optimiseTechSetupBlocks} from "./opti_TechSetUpBlocks.js";

const autoTechSetUp = (timeTable, date) => {

    const generatedBlocks = [];

    const blockRequiringTechInstall = blockList => blockList.filter(block => block.needsTechInstall);
    const noAdditionalSetup = blockRequiringTechInstall(timeTable).length === 0;

    const addStandardSetUp = date => new TechSetUp(

        /*standard setup is the base case in a daily operation scenario*/

        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
        15,
        [11, 0],
        [art1],
        {
            title: "techSetUp",
            description: ["PREP Standard setup"]
        },
        "generatedBlock"

    );

    generatedBlocks.push(addStandardSetUp(date));

    if (noAdditionalSetup) {

        return generatedBlocks;

    }

    /*If there is a need for another installation dependant of another activity earlier, we transfer the setup tasks to the earliest block */
    blockRequiringTechInstall(timeTable).forEach(block => {

        if (block.type === "rehearsal") {

            generatedBlocks.push(new TechSetUp(
                    date,
                    15,
                    decrementTime(block.startTime, 15),
                    [art1],
                    {
                        title: "techSetUp",
                        description: [`Prep ${block.type} ${block.location} ${block.startTime}`]
                    },
                    "generatedBlock"

                )
            )
            //DEL TEST ->
            generatedBlocks.push(new TechSetUp(
                    date,
                    15,
                    decrementTime(block.startTime, 30),
                    [art1],
                    {
                        title: "techSetUp",
                        description: [`Prep2 ${block.type} ${block.location} ${block.startTime}`]
                    },
                    "generatedBlock"

                )
            )


        }
    })


    return optimiseTechSetupBlocks(generatedBlocks);
    //return generatedBlocks;

}

export {autoTechSetUp};