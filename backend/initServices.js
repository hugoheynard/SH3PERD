import {UserService} from "./Services/users/UserService.js";
import {CalendarService} from "./Services/CalendarService/CalendarService.js";
import {CalendarBuilder} from "./Services/CalendarService/class_CalendarBuilder.js";
import {EventGenerator} from "./Services/CalendarService/class_EventGenerator.js";
import {PlanningCollisionManager} from "./Services/CalendarService/class PlanningCollisionManager.js";
import {ContractService} from "./Services/contracts/ContractService.js";
import {CompanyService} from "./Services/company/CompanyService.js";
import {EventService} from "./Services/events/EventService.js";
import {EventQueryBuilder} from "./Services/events/EventQueryBuilder.js";
import {UserQueryBuilder} from "./Services/users/UserQueryBuilder.js";
import {StaffSortingAlgorithms} from "./Services/users/StaffSortingAlgorithms.js";
import {EventGridPositionCalculator} from "./Services/CalendarService/EventGridPositionCalculator.js";
import {SettingsService} from "./Services/settings/SettingsService.js";


export const initServices = ({ db }) => {
    return {
        contractService: new ContractService({ collection: db.collection('contracts') }),
        companyService: new CompanyService({ collection: db.collection('companies') }),

        userService: new UserService({
            collection: db.collection('staffs'),
            tools: {
                queryBuilder: UserQueryBuilder,
                staffSorter: StaffSortingAlgorithms
            }
        }),

        eventService: new EventService( {
            collection: db.collection('calendar_events'),
            tools: {
                queryBuilder: EventQueryBuilder
            }

        }),

        calendarService: new CalendarService({
            tools: {
                eventGridPositionCalculator: EventGridPositionCalculator,
                builder: CalendarBuilder,
                planningCollisionManager: PlanningCollisionManager,
                eventGenerator: EventGenerator,
                //staffInteractionTool: StaffInteractionModule
            },
        }),

        settingsService: new SettingsService({
            collection: db.collection('settings')
        })
    }
}