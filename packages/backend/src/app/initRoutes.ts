import express, {type Express, type NextFunction, type Request, type Response} from "express";
import cors from "cors";
import {errorCatcher} from "../routes/middlewares/errorCatcher";
import {authenticationRouter} from "../authentication/authenticationRouter";
import {settingsRouter} from "../routes/settings/settingsRouter";
import {calendarRouter} from "../routes/calendar/calendarRouter";
import {planningBlocksRouter} from "../planningBlocks/planningBlocksRouter";
import {musicLibraryRouter} from "../routes/musicLibrary/musicLibraryRouter";
import {playlistRouter} from "../playlist/playlistRouter";
import {addUser_id} from "../playlist/middlewares/addUser_id";
import {registerRoute} from "../../../api-auth/src/routes/register.route";


export const initRoutes = (app: Express, { controllers } : any, { middlewares }: any): Express => {
    try {
// middlewares
        app.use(cors());
        app.use(express.json());


//Routers

        app.use('/register', registerRoute({
            registrationController: controllers.registrationController,
            registrationMiddlewares: middlewares.registration
        }));




        //app.use('/auth', authenticationRouter(controllers.authenticationController));
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

        app.use((req: Request, res: Response, next: NextFunction): void => {
            res.status(404).send('Route does not exist');
            console.log(`[404] ${req.method} ${req.url}`);
        });


        app.use(errorCatcher);

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
