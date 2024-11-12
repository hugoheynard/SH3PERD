import express from "express";
import cors from "cors";
import {authenticationRouter} from "./Routes/authentication/authentication_Router.js";
import {calendarRouter} from "./Routes/calendar/calendarRouter.js";
import {companyRouter} from "./Routes/company_Router.js";
import {musicLibraryRouter} from "./Routes/musicLibrary_Routes.js";
import {settingsRouter} from "./Routes/settings/settings_Router.js";
import {staffRouter} from "./Routes/staff/staffRouter.js";



export const initRoutes = (app, { db, controllers }) => {
// middlewares
    app.use(cors());
    app.use(express.json());

//Routers
    app.use('/auth', authenticationRouter(db)); //TODO on pourrait injecter seulement une collection de login et tokens pour limiter la propagation de la db sur un point critique?
    app.use('/settings', companyRouter(controllers.companyController));
    app.use('/staff', staffRouter(controllers.staffController));
    app.use('/calendar', calendarRouter(controllers.calendarController));
    app.use('/musicLibrary', musicLibraryRouter);
    app.use('/settings', settingsRouter(controllers.settingsController));

    app.use((req, res, next) => {
        res.status(404).send('Route does not exist');
    });

    return app;
};
