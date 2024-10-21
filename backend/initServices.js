import {UserService} from "./Services/users/UserService.js";
import {CalendarService} from "./Services/CalendarService/class_CalendarService.js";
import {CalendarBuilder} from "./Services/CalendarService/class_CalendarBuilder.js";
import {EventGenerator} from "./Services/CalendarService/class_EventGenerator.js";
import {PlanningCollisionManager} from "./Services/CalendarService/class PlanningCollisionManager.js";
import {ContractService} from "./Services/contracts/ContractService.js";
import {CompanyService} from "./Services/company/CompanyService.js";
import {EventService} from "./Services/events/EventService.js";

export const initServices = ({ db }) => {
    return {
        contractService: new ContractService({ collection: db.collection('contracts') }),
        companyService: new CompanyService({ collection: db.collection('companies') }),
        userService: new UserService({ collection: db.collection('staffs') }),
        eventService: new EventService( { collection: db.collection('calendar_events') }),
        calendarService: new CalendarService({
            builder: new CalendarBuilder(),
            eventGenerator: new EventGenerator(),
            planningCollisionManager:  new PlanningCollisionManager(),
            //staffInteractionTool: new StaffInteractionModule()
        })
    }
}
