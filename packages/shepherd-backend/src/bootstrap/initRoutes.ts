import type {Express, NextFunction, Request, Response} from "express";
import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors";
import {notFound_404_Handler} from "../utils/errorManagement/middlewares/notFound_404_Handler.js";
import {errorCatcher} from "../utils/errorManagement/middlewares/errorCatcher.js";
import {createAuthRouter} from "../auth/api/routes/createAuthRouter.js";
import {createMusicLibraryRouter} from "../music/api/createMusicLibraryRouter.js";


export const initRoutes = async (app: Express, { controllers } : any, { globalMiddlewares } : any, { useCases }: any): Promise<Express> => {
    try {
        const { register, auth } = controllers;
        const { verifyAuthToken } = globalMiddlewares;
        const { musicRepertoire } = useCases;


        // middlewares
        app.use(cors({
            origin: 'http://localhost:4200',
            credentials: true
        }));
        app.use(cookieParser());
        app.use(express.json());

        app.use('/api/protected', verifyAuthToken);

        //Routers
        app.use('/api', await createAuthRouter({
            registerUserCtrl: register.registerUser,
            loginUserCtrl: auth.login,
            //logoutUserCtrl: auth.logout,
            refreshAuthSessionCtrl: auth.refreshSession
        }));


        app.use('/api/protected', await createMusicLibraryRouter({
            useCases: musicRepertoire,
        }));



/*
        app.use('/settings', settingsRouter(controllers.settingsController));
        app.use('/planningBlocks', planningBlocksRouter(controllers.planningBlocksController))
        app.use('/calendar', calendarRouter(controllers.calendarController));


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
