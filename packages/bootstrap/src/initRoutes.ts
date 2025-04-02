import type {Express, Request, Response} from "express";
import express from "express"
import cors from "cors";
import {errorCatcherMw_simple, notFound_404_Handler} from "@sh3pherd/shared-utils";
import {createRegisterRouter} from "@sh3pherd/auth";



export const initRoutes = (app: Express, { controllers } : any, { middlewares }: any): Express => {
    try {
        // middlewares
        app.use(cors());
        app.use(express.json());

        //Routers
        app.use('/register', createRegisterRouter({
            registerController: controllers.registerController,
            registerMiddlewares: middlewares.registration
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
