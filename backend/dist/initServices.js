import {} from "mongodb";
import { userService } from "./services/userService.js";
import { eventService } from "./services/eventService.js";
import { authenticationService } from "./services/authenticationService.js";
import { PasswordHasher } from "./tools/login/PasswordHasher.js";
import { JWT_module } from "./tools/login/JWT_Module.js";
import { settingsService } from "./services/settingsService.js";
import { calendarService } from "./services/calendarService.js";
export const initServices = (db) => {
    try {
        if (db === null) {
            throw new Error('Database connection is not initialized');
        }
        const settingsServiceInstance = settingsService({ collection: db.collection('settings') });
        const eventServiceInstance = eventService({ collection: db.collection('calendar_events') });
        const userServiceInstance = userService({ collection: db.collection('staffs') });
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
    }
    catch (e) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
};
//# sourceMappingURL=initServices.js.map