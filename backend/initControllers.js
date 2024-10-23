import {UserController} from "./Services/users/UserController.js";
import {CalendarController} from "./Services/CalendarService/CalendarController.js";
import {ContractController} from "./Services/contracts/ContractController.js";
import {CompanyController} from "./Services/company/CompanyController.js";


export const initControllers = ({ services }) => {
    return {
        userController: new UserController({
            contractService: services.contractService,
            companyService: services.companyService
        }),

        companyController: new CompanyController({ companyService: services.companyService }),

        contractController: new ContractController({
            contractService: services.contractService,
            companyService: services.companyService
        }),

        staffController: new UserController({ userService: services.userService }),

        calendarController: new CalendarController({
            calendarService: services.calendarService,
            userService: services.userService,
            eventService: services.eventService
        })
    }
};