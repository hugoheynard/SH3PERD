/*
DESCRIBES THE BASE CASE : evenly distributed 30 mins slots, the workload balances on a weekly scale

* we start by the constraints to fill the slots with available people
* -> private starter can't finish
* -> incapacityBlock can't be push


* -> must define if it's a 2 DJ / 3DJ rotation
* -> can include a 20min split
* -> can include, reverse Rotation for must not finish
* -> optimize "freeTime"
* -> give time to techBlock DJ
*/


import {myStaff} from "../../../test.js";
import {noSplit, RotationContext, structure, structure2, structure3} from "../Strategies/start_spreadEvenly.js";

const staffMemberPerCat = (category, day) => myStaff
    .filter(staff => staff.presenceLog[day].workingDay)
    .filter(workingStaff => workingStaff.category === category);




//test generated but empty
const baseCaseRotation = [];



baseCaseRotation.push(...structure);
baseCaseRotation.push(...structure2);
baseCaseRotation.push(...structure3);
//baseCaseRotation.push(...buildRotationArray([15, 0], [20, 0], 30));


const privateEvent = blockArray => blockArray.filter(block => block.type === "private").length !== 0;

//MWOUI...
const membersStartingPrivate = blockArray => {

    return blockArray.filter(block => block.type === "private").membersArray

}

const getMembersOrder = (assignedPool, rotationArray) => {

    const membersOrder = [];

    for (let i = 0; i < rotationArray.length; i++) {


    }


    console.log(membersOrder)
}

getMembersOrder( [...myStaff.filter(staff => staff.firstName === "Tanguy" || staff.firstName === "Hugo")], baseCaseRotation)




const removePeopleWithConstraints = rotationArray => {

    const filledArray = rotationArray;
    const lastBlock = (index, array) => index === array.length - 1;

    // iterates backwards
    for (let i = rotationArray.length - 1; i > 0; i--) {

        if (lastBlock(i, rotationArray)) {

            //use splice to remove DJ from last block
            rotationArray[i].membersArray.push(...myStaff.filter(staff => staff.firstName === "Tanguy"))

        }


    }




    return filledArray;
}



export {baseCaseRotation};