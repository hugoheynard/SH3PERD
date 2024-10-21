import {UserController} from "./Services/users/UserController.js";
import {StaffController} from "./Services/staff/StaffController.js";
import {CalendarController} from "./Services/CalendarService/CalendarController.js";
import {ContractController} from "./Services/contracts/ContractController.js";



export const initControllers = ({ services }) => {
    return {
        userController: new UserController({
            contractService: services.contractService,
            companyService: services.companyService
        }),
        contractController: new ContractController({
            contractService: services.contractService,
            companyService: services.companyService
        }),
        staffController: new StaffController({ userService: services.userService }),
        calendarController: new CalendarController({ staffService: services.calendarService })
    }
};