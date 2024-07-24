import {GetIn} from "../../Classes/Activity_classes/class_GetIn.js";
import {allMembersInBlockList} from "../../Utilities/BlocklistFunctions/allMembersInBlockList.js";
import {substractMinutes} from "../../Utilities/Date_functions.js";

/*
*ROLE : manage GetInBlocks for every Member
*HOW By knowing which task/block is the first in the day of a staffMember, we can define the arrival time
*MUST : be called after all the other push of blocks
*INPUT : the current array of blocks generated
*OUTPUT : an array of getInBlocks
*/

const autoGetIn = (arrayOfBlocks, date) => {

    const generatedBlocks = [];

    allMembersInBlockList(arrayOfBlocks).forEach(member => {

        const returnBlocksThatIncludeElement =  (arrayOfBlocks, element) => arrayOfBlocks.filter(block => block.staff.includes(element));

        const firstBlock = returnBlocksThatIncludeElement(arrayOfBlocks, member)[0];

        let minusTime;

        switch (firstBlock.type) {

            case 'techSetUp':
                minusTime = 5;
                break;

            case 'meeting':
                minusTime = 5;
                break;

            case 'meal':
                minusTime = 5;
                break;

            case 'rehearsal':
                minusTime = 15;
                break;

            case 'show':
                minusTime = 60;
                break;

        }

        generatedBlocks.push(new GetIn(substractMinutes(new Date(firstBlock.date), minusTime), undefined, [], [member]));

    });

    return generatedBlocks;
};

export {autoGetIn};