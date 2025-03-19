import express, {type Express, type NextFunction, type Request, type Response} from "express";
import cors from "cors";
import {errorCatcher} from "./routes/middlewares/errorCatcher";

import {authenticationRouter} from "./routes/authentication/authenticationRouter";
import {settingsRouter} from "./routes/settings/settingsRouter";
import {calendarRouter} from "./routes/calendar/calendarRouter";
import {eventsRouter} from "./routes/events/eventsRouter";
import {musicLibraryRouter} from "./routes/musicLibrary/musicLibraryRouter";
import {playlistRouter} from "./playlist/playlistRouter";


export const initRoutes = (app: Express, { controllers } : any, { middlewares }: any): Express => {
    try {
// middlewares
        app.use(cors());
        app.use(express.json());

//Routers
        app.use('/auth', authenticationRouter(controllers.authenticationController));
        app.use('/settings', settingsRouter(controllers.settingsController));
        app.use('/events', eventsRouter(controllers.eventsController))
        app.use('/calendar', calendarRouter(controllers.calendarController));
        app.use('/musicLibrary', musicLibraryRouter(controllers.musicLibraryController));
        app.use('/playlist', playlistRouter(controllers.playlistController, middlewares.playlist));
        //app.use('/staff', userRouter(controllers.staffController));
        //app.use('/company', companyRouter(controllers.companyController));



        app.use((req: Request, res: Response, next: NextFunction): void => {
            res.status(404).send('Route does not exist');
        });

        app.use(errorCatcher);

        return app;
    } catch (e) {
        console.error('Error during controller routes:', e);
        throw new Error('Failed to initialize routes');
    }
};
