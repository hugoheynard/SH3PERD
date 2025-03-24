import dotenv from "dotenv";
import express, {type Express} from 'express';
import {type Db} from "mongodb";

import {connectDb} from "./app/db";
import {initServices} from "./app/initServices";
import {type Controllers, initControllers} from "./app/initControllers";
import {startServer} from "./app/server";
import {initMiddlewares} from "./app/initMiddlewares";
import {initRoutes} from "./app/initRoutes";


dotenv.config({path: '../.env'});
console.log('[TRACE] .env loaded');

async function startApp(): Promise<void> {
    try {
        const db: Db | null = await connectDb();
        const app: Express = express();

        const services = await initServices(db);
        const middlewares = initMiddlewares({ services });
        const controllers: Controllers = initControllers({ services });
        initRoutes(app, { controllers } , { middlewares });
        await startServer(app);


    } catch (error: any) {
        console.error('Error starting the app:', error);
        //process.exit(1);
    }
}

await startApp();