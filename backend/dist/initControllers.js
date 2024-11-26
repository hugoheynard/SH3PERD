import { authenticationController } from "./controllers/authenticationController.js";
import { settingsController } from "./controllers/settingsController.js";
import { calendarController } from "./controllers/calendarController.js";
import { eventsController } from "./controllers/eventController.js";
export const initControllers = ({ services }) => {
    try {
        return {
            authenticationController: authenticationController({ authenticationService: services.authenticationService }),
            settingsController: settingsController({ settingsService: services.settingsService }),
            eventsController: eventsController({ eventService: services.eventService }), //TODO: on en est là test API
            calendarController: calendarController({ calendarService: services.calendarService, userService: services.userService, eventService: services.eventService }),
            /*
                        userController: userController({
                            services: {
                                contractService: services.contractService,
                                companyService: services.companyService
                            }
                        }),

                        companyController: new CompanyController({companyService: services.companyService}),

                        contractController: contractController({
                            contractService: services.contractService,
                            companyService: services.companyService
                        }),

                        staffController: userController({
                            services: {
                                userService: services.userService
                            }
                        }),


                        */
        };
    }
    catch (e) {
        console.error('Error during controller initialization:', e);
        throw new Error('Failed to initialize services');
    }
};
//# sourceMappingURL=initControllers.js.map