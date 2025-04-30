import type {Express, NextFunction, Request, Response} from "express";
import express from "express"
import cors from "cors";
import {errorCatcherMw_simple, notFound_404_Handler} from "@sh3pherd/shared-utils";
import {createAuthRouter} from "@sh3pherd/auth";



export const initRoutes = async (app: Express, { controllers } : any, { globalMiddlewares } : any): Promise<Express> => {
    try {
        const { register, auth } = controllers;
        const { verifyAuthToken } = globalMiddlewares;


        // middlewares
        app.use(cors({
            origin: 'http://localhost:4200',
            credentials: true
        }));
        app.use(express.json());

        //Routers
        app.use('/api', await createAuthRouter({
            registerUserCtrl: register.registerUser,
            loginUserCtrl: auth.login
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
        app.use(errorCatcherMw_simple);

        console.log('✅ initRoutes executed');
        app._router.stack.forEach((layer: any) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                console.log(`📡 ${methods} ${layer.route.path}`);
            }
        });
        console.log('✅ initRoutes executed');
        return app;
    } catch (e) {
        console.error('Error during controller routes:', e);
        throw new Error('Failed to initialize routes');
    }
};
