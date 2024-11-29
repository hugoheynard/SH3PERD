import {authenticationController} from "./controllers/authenticationController";
import {settingsController} from "./controllers/settingsController";
import {calendarController} from "./controllers/calendarController";
import {eventsController} from "./controllers/eventController";


export interface Controllers {
    settingsController: any;
    [key: string]: any;
}

export const initControllers = ({services}: any): any => {

    try {
        return {
            authenticationController: authenticationController({ authenticationService: services.authenticationService }),
            settingsController: settingsController({ settingsService: services.settingsService}),
            eventsController: eventsController({ eventService: services.eventService}), //TODO: on en est là test API
            calendarController: calendarController({ calendarService: services.calendarService, userService: services.userService, eventService: services.eventService}),
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

        }
    } catch (e) {
        console.error('Error during controller initialization:', e);
        throw new Error('Failed to initialize services');
    }
};