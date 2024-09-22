import {CalendarService} from "../Services/CalendarService/class_CalendarService.js";




export class AppManager {
    constructor() {
        this._calendarService = new CalendarService();
    };
    get calendarService() {
        return this._calendarService;
    };

}