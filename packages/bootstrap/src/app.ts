import dotenv from "dotenv";
import express, {type Express} from 'express';
import {type Db} from "mongodb";

import {connectDb} from "./db";
import {initServices} from "./initServices";
import {initControllers, type AppControllers} from "./initControllers";
import {startServer} from "./server";
import {initMiddlewares} from "./initMiddlewares";
import {initRoutes} from "./initRoutes";


dotenv.config({path: '../.env'});
console.log('[TRACE] .env loaded');

async function startApp(): Promise<void> {
    try {
        const db: Db | null = await connectDb();
        const app: Express = express();

        const services = await initServices(db);
        const middlewares = initMiddlewares({ services });
        const controllers: AppControllers = initControllers({ services });
        initRoutes(app, { controllers } , { middlewares });


        await startServer(app);


    } catch (error: any) {
        console.error('Error starting the app:', error);
        //process.exit(1);
    }
}

await startApp();