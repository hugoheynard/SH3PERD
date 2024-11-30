import {type Db} from "mongodb";
import {type UserService, userService} from "./services/userService";
import {eventService} from "./services/eventService";
import {authenticationService} from "./services/authenticationService";
import {PasswordHasher} from "./tools/login/PasswordHasher";
import {JWT_module} from "./tools/login/JWT_Module";
import {settingsService} from "./services/settingsService";
import {calendarService} from "./services/calendarService";



export const initServices = (db: Db | null): any => {
    try {
        if (db === null) {
            throw new Error('Database connection is not initialized');
        }

        const settingsServiceInstance = settingsService({ collection: db.collection('settings') });
        const eventServiceInstance: any = eventService( { collection: db.collection('calendar_events') });
        const userServiceInstance: UserService = userService({ collection: db.collection('staffs') });

        return {
            authenticationService: authenticationService({
                collection: db.collection('staffs'),
                verifyPasswordFunction: new PasswordHasher().verify,
                generateTokenFunction: JWT_module.getToken,
                checkAuthTokenValidityFunction: JWT_module.decode
            }),
            settingsService: settingsServiceInstance,
            eventService: eventServiceInstance,
            calendarService: calendarService({
                eventService: eventServiceInstance,
                userService: userServiceInstance
            }),

            //contractService: contractService({ collection: db.collection('contracts') }),
            //companyService: companyService({ collection: db.collection('companies') }),
            //userService: userService,

            //

        };
    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}