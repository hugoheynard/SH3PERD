import express from "express";
import cors from "cors";
import {authenticationRouter} from "./Routes/authentication/authentication_Router.js";
import {companyRouter} from "./Routes/company_Router.js";
import {calendarRouter} from "./Routes/calendar/calendar_Router.js";
import {musicLibraryRouter} from "./Routes/musicLibrary_Routes.js";
import {companySettings_Router} from "./Routes/settings_Router.js";

export const initRoutes = (app, db) => {
// middlewares
    app.use(cors());
    app.use(express.json());

//Routers
    app.use('/auth', authenticationRouter(db)); //TODO on pourrait injecter seulement une collection de login et tokens pour limiter la propagation de la db sur un point critique?
    app.use('/company', companyRouter);
    app.use('/calendar', calendarRouter);
    app.use('/musicLibrary', musicLibraryRouter);
    app.use('/company/settings', companySettings_Router);

    app.use((req, res, next) => {
        res.status(404).send('Route does not exist');
    });

    return app;
};
