/*
The task will be completed by dividing the task into constraint blocks
evenly distributed in time and human ressources in the baseCase free slots
*
*
* INPUTS :
* -> totalduration to complete task
* -> members assigned to task
* -> startTime
*
*DISTRIBUTION OF WORKLOAD STRATEGIES
determine ratios workload / void
onePlaysAll - one void block takes all time
            - one work block takes all time
egalitarian,
oneFree(ManyWorking) - one void block takes all time
                       one showblock split in number of workers

 */




/*INTERFACE :  */
import {timeArrayInMinutes} from "../../Utilities/timeFunctions/timeArrayInMinutes.js";
import {Block_show} from "../../Classes/Activity_classes/Block_Factory/subClass_Block_show.js";
import {incrementTime} from "../../Utilities/timeFunctions/incrementTime.js";
import {myStaff} from "../../../test.js";
import {Block_void} from "../../Classes/Activity_classes/Block_Factory/subClass_Block_void.js";

class RotationStrategy {
    createStructure(startTime, endTime) {
        throw new Error('This method should be overridden!');
    };
}



/*fullHoursSplit*/
class noSplit extends RotationStrategy {
    constructor() {

        super();

    };

    createStructure(startTime, endTime) {

        const rotations = [];

        const totalDuration = timeArrayInMinutes(endTime) - timeArrayInMinutes(startTime);
        const rotationDuration = totalDuration;
        const numberOfRotations = totalDuration / rotationDuration;

        for (let i = 0; i < numberOfRotations; i++) {

            rotations.push(new Block_show(

                "",
                rotationDuration,
                incrementTime(startTime, rotationDuration, i),
                [...myStaff.filter(staff => staff.firstName === "Tanguy")]

            ));

            rotations.push(new Block_void(

                "",
                rotationDuration,
                incrementTime(startTime, rotationDuration, i),
                [...myStaff.filter(staff => staff.firstName === "Hugo" || staff.firstName === "Antoine")]

            ));

        }


        return rotations
    }

}

/* HalfSplit*/
class HalfSplit extends RotationStrategy {
    constructor() {

        super();

    };

    createStructure(startTime, endTime) {

        const rotations = [];

        const totalDuration = timeArrayInMinutes(endTime) - timeArrayInMinutes(startTime);
        const rotationDuration = totalDuration / 2;
        const numberOfRotations = totalDuration / rotationDuration;

        for (let i = 0; i < numberOfRotations; i++) {

            rotations.push(new Block_show(

                "",
                rotationDuration,
                incrementTime(startTime, rotationDuration, i),
                [...myStaff.filter(staff => staff.firstName === "Tanguy")]

            ));

            rotations.push(new Block_void(

                "",
                rotationDuration,
                incrementTime(startTime, rotationDuration, i),
                [...myStaff.filter(staff => staff.firstName === "Hugo" || staff.firstName === "Antoine")]

            ));

        }


        return rotations
    }



}

/* OneThirdSplit*/
class ThirdSplit extends RotationStrategy {
    constructor() {

        super();

    };

    createStructure(startTime, endTime) {

        const rotations = [];

        const totalDuration = timeArrayInMinutes(endTime) - timeArrayInMinutes(startTime);
        const rotationDuration = totalDuration / 3;
        const numberOfRotations = totalDuration / rotationDuration;

        for (let i = 0; i < numberOfRotations; i++) {

            rotations.push(new Block_show(

                "",
                rotationDuration,
                incrementTime(startTime, rotationDuration, i),
                [...myStaff.filter(staff => staff.firstName === "Tanguy" || staff.firstName === "Hugo")]

            ));

        }


        return rotations
    }
}



class RotationContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    createStructure(startTime, endTime) {
        return this.strategy.createStructure(startTime, endTime);

    }
}






const firstContext = new RotationContext(new noSplit).createStructure([12, 0], [13, 0]);
const secondContext = new RotationContext(new HalfSplit).createStructure([13, 0], [14, 0]);
const thirdContext = new RotationContext(new ThirdSplit).createStructure([14, 0], [15, 0]);
const structure = firstContext;
const structure2 = secondContext;

const structure3 = thirdContext;




export {RotationContext, noSplit, structure, structure2, structure3};