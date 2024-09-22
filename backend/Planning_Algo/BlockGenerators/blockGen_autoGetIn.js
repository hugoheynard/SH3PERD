import {GetIn} from "../../Classes/Activity_classes/class_GetIn.js";
import {TimetableAction} from "../../Utilities/BlocklistFunctions/allMembersInBlockList.js";
import {DateMethod} from "../../Utilities/class_DateMethods.js";

/*
*ROLE : manage GetInBlocks for every Member
*HOW By knowing which task/block is the first in the day of a staffMember, we can define the arrival time
*MUST : be called after all the other push of blocks
*INPUT : the current array of blocks generated
*OUTPUT : an array of getInBlocks
*/
class Auto_GetIn {
    constructor(input) {
        this._timeTable = input.timeTable;
        this._generatedBlocks = [];
    };
    get timeTable() {
        return this._timeTable;
    };
    get generatedBlocks() {
        return this._generatedBlocks;
    };

    buildGetInBlocks() {
        new TimetableAction({timetable: this.timeTable}).allStaffMembersInTimetable().forEach(member => {

            const returnBlocksThatIncludeElement =  (arrayOfBlocks, element) => arrayOfBlocks.filter(block => block.staff.includes(element));

            const firstBlock = returnBlocksThatIncludeElement(this.timeTable, member)[0];

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

            this.generatedBlocks.push(new GetIn(
                {
                    date: DateMethod.substractMinutes(new Date(firstBlock.date), minusTime ?? 5),
                    duration: undefined,
                    staff: [member]
                })
            );

        });

        return this.generatedBlocks;
    };
}

export {Auto_GetIn};