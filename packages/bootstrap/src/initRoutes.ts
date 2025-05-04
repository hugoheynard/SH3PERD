import type {Express, NextFunction, Request, Response} from "express";
import express from "express"
import cors from "cors";
import {errorCatcher, errorCatcherMw_simple, notFound_404_Handler} from "@sh3pherd/shared-utils";
import {createAuthRouter} from "@sh3pherd/auth";
import cookieParser from "cookie-parser";



export const initRoutes = async (app: Express, { controllers } : any, { globalMiddlewares } : any): Promise<Express> => {
    try {
        const { register, authCtrl } = controllers;
        const { verifyAuthToken } = globalMiddlewares;


        // middlewares
        app.use(cors({
            origin: 'http://localhost:4200',
            credentials: true
        }));
        app.use(cookieParser());
        app.use(express.json());


        //Routers
        app.use('/api', await createAuthRouter({
            registerUserCtrl: register.registerUser,
            loginUserCtrl: authCtrl.login,
            refreshAuthSessionCtrl: authCtrl.refreshSession
        }));




/*
        app.use('/settings', settingsRouter(controllers.settingsController));
        app.use('/planningBlocks', planningBlocksRouter(controllers.planningBlocksController))
        app.use('/calendar', calendarRouter(controllers.calendarController));
        app.use('/musicLibrary', musicLibraryRouter(controllers.musicLibraryController));

        app.use('/playlist', addUser_id, playlistRouter(
            controllers.playlistController,
            middlewares.playlist
        ));
        //app.use('/staff', userRouter(controllers.staffController));
        //app.use('/company', companyRouter(controllers.companyController));
*/
        // Error handling
        app.use(notFound_404_Handler);
        app.use(errorCatcher);

        console.log('✅ initRoutes executed');

        return app;
    } catch (e) {
        console.error('Error during controller routes:', e);
        throw new Error('Failed to initialize routes');
    }
};
