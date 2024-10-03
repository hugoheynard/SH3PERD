import {CalendarRessourceProvider} from "./class_CalendarRessourceProvider.js";
import {EventGenerator} from "./class_EventGenerator.js";
import {CalendarBuilder} from "./class_CalendarBuilder.js";
import {EventColliderModule} from "./class_EventCollider.js";
import {StaffCrossEventsModule} from "./class_StaffCrossEventsModule;.js";


export class CalendarService {
    constructor() {
        this.ressourceProvider = new CalendarRessourceProvider();
        this.builder = new CalendarBuilder();
        this.eventGenerator = new EventGenerator();
        this.individualPlanningCollider = new EventColliderModule();
        this.partnerPlanningCollider = new StaffCrossEventsModule();
        //this.staffInteractionTool = new StaffInteractionModule();
    };
}