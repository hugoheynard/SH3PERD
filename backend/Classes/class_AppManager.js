import {CalendarController} from "../Services/CalendarService/class_CalendarController.js";


export class AppManager {
    constructor() {
        this._calendarController = new CalendarController();
    };
    get calendarController() {
        return this._calendarController;
    };

}