import {Day} from "../Classes/class_Day.js";
import {addDays} from "../Utilities/Date_functions.js";
/*Used to generate the instances of Days and returns them in an array*/

const buildCurrentWeek = (startDate) => {

    const currentWeek = [];

    //generate weekdays
    for (let i = 0; i <= 6; i++) {

        let dayDate = addDays(startDate, i);
        currentWeek.push(new Day(dayDate));

    }

    return currentWeek;

};

export {buildCurrentWeek};