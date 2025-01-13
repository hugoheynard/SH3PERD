import dotenv from "dotenv";
import express, {type Express} from 'express';
import {type Db} from "mongodb";

import {connectDb} from "./db";
import {initServices} from "./initServices";
import {type Controllers, initControllers} from "./initControllers";
import {initRoutes} from "./initRoutes";
import {startServer} from "./server";


dotenv.config({path: '../.env'});

async function startApp(): Promise<void> {
    try {
        const db: Db | null = await connectDb();
        const app: Express = express();

        const services = initServices(db);
        const controllers: Controllers = initControllers({ services });

        initRoutes(app, { db, controllers });
        await startServer(app);

    } catch (error: any) {
        console.error('Error starting the app:', error);
        //process.exit(1);
    }
}

await startApp();