import express, {} from "express";
import cors from "cors";
import { errorCatcher } from "./routes/middlewares/errorCatcher.js";
import { authenticationRouter } from "./routes/authentication/authenticationRouter.js";
import { settingsRouter } from "./routes/settings/settingsRouter.js";
import { calendarRouter } from "./routes/calendar/calendarRouter.js";
import { eventsRouter } from "./routes/events/eventsRouter.js";
export const initRoutes = (app, { controllers }) => {
    try {
        // middlewares
        app.use(cors());
        app.use(express.json());
        //Routers
        app.use('/auth', authenticationRouter(controllers.authenticationController));
        app.use('/settings', settingsRouter(controllers.settingsController));
        app.use('/events', eventsRouter(controllers.eventsController));
        app.use('/calendar', calendarRouter(controllers.calendarController));
        //app.use('/staff', userRouter(controllers.staffController));
        //app.use('/company', companyRouter(controllers.companyController));
        //
        //app.use('/musicLibrary', musicLibraryRouter);
        app.use((req, res, next) => {
            res.status(404).send('Route does not exist');
        });
        app.use(errorCatcher);
        return app;
    }
    catch (e) {
        console.error('Error during controller routes:', e);
        throw new Error('Failed to initialize routes');
    }
};
//# sourceMappingURL=initRoutes.js.map