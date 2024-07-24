import {indexOfDay} from "../../Utilities/Date_functions.js";

class RecurrentEvent {
    constructor(firstEventDate, lastEventDate, name, type) {

        this.firstEventDate = firstEventDate;
        this.lastEventDate = lastEventDate;
        this.dayIndex = indexOfDay(this.firstEventDate);
        this.name = name;
        this.type = type;

    };

}

export {RecurrentEvent};