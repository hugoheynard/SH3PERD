import {CalendarRessourceProvider} from "./class_CalendarRessourceProvider.js";
import {EventGenerator} from "./class_EventGenerator.js";
import {CalendarBuilder} from "./class_CalendarBuilder.js";
import {EventColliderModule} from "./class_EventCollider.js";



export class CalendarService {
    constructor() {
        this.ressourceProvider = new CalendarRessourceProvider();
        this.builder = new CalendarBuilder();
        this.eventGenerator = new EventGenerator();
        this.individualPlanningCollider = new EventColliderModule();
        //this.staffInteractionTool = new StaffInteractionModule();
    };
}