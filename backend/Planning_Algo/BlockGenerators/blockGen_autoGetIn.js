import {DateMethod} from "../../Utilities/class_DateMethods.js";
import {findEarliestEventInArray} from "../../Utilities/sortBlockArray.js";

/*
*ROLE : manage GetInBlocks for every Member
*HOW By knowing which task/block is the first in the day of a staffMember, we can define the arrival time
*MUST : be called after all the other push of blocks
*INPUT : the current array of blocks generated
*OUTPUT : an array of getInBlocks
*/
class Auto_GetIn {
    constructor() {
        this._generatedBlocks = [];
    };
    get generatedBlocks() {
        return this._generatedBlocks;
    };

    generate(data) {
        this.generatedBlocks.length = 0;

        for (const planning of data.plannings) {

            const eventArray = planning.calendar_events.map(event => data.events[event]);

            if (eventArray.length) {
                const firstBlock = findEarliestEventInArray(eventArray);

                let minusTime;
                //TODO: search in season config collection - get in rules
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

                this.generatedBlocks.push(
                    {
                        _id: `generatedGetIn_${planning.staff_id}`,
                        date: DateMethod.substractMinutes(firstBlock.date, minusTime ?? 5),
                        duration: 5,
                        participants: planning.staff_id,
                        type: 'getIn',
                        generated: true
                    }
                );
            }
        }
        return this.generatedBlocks;
    };
}

export {Auto_GetIn};