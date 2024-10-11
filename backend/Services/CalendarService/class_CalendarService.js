import {CalendarRessourceProvider} from "./class_CalendarRessourceProvider.js";
import {EventGenerator} from "./class_EventGenerator.js";
import {CalendarBuilder} from "./class_CalendarBuilder.js";
import {PlanningCollisionManager} from "./class PlanningCollisionManager.js";


export class CalendarService {
    constructor() {
        this.ressourceProvider = new CalendarRessourceProvider();
        this.builder = new CalendarBuilder();
        this.eventGenerator = new EventGenerator();
        this.planningCollisionManager = new PlanningCollisionManager();
        //this.staffInteractionTool = new StaffInteractionModule();
    };
}