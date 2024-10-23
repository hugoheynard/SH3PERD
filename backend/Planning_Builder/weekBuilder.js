import {Day} from "../Services/CalendarService/CalendarService.js";
import {DateMethod} from "../Utilities/class_DateMethods.js";
/*Used to generate the instances of Days and returns them in an array*/

const buildCurrentWeek = (startDate) => {

    const currentWeek = [];

    //generate weekdays
    for (let i = 0; i <= 6; i++) {

        let dayDate = DateMethod.addDays(startDate, i);
        currentWeek.push(new Day(dayDate));

    }

    return currentWeek;

};

export {buildCurrentWeek};