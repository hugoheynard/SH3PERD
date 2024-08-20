import {DateMethod} from "../../Utilities/class_DateMethods.js";

class RecurrentEvent {
    constructor(firstEventDate, lastEventDate, name, type) {

        this.firstEventDate = firstEventDate;
        this.lastEventDate = lastEventDate;
        this.dayIndex = DateMethod.indexOfDay(this.firstEventDate);
        this.name = name;
        this.type = type;

    };

}

export {RecurrentEvent};