import {Show} from "../../Classes/Activity_classes/class_Show.js";


const addCabBlocks = obj => {

    const cabBlocks = [];

    if (obj.cabaret) {

        obj.cabaret.forEach((cabShow, index) => {

            cabBlocks.push(new Show(index, undefined, cabShow.startTime, cabShow.staff));

        });

    }

    return cabBlocks;

}

export {addCabBlocks};