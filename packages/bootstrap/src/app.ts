import dotenv from "dotenv";
import express, {type Express} from 'express';
import {type Db} from "mongodb";


import {connectToCoreDb} from "./connectToCoreDb";
import {createRepositories} from "./createRepositories";
import {initServices} from "./initServices";
import {initControllers, type AppControllers} from "./initControllers";
import {initRoutes} from "./initRoutes";
import {startServer} from "./server";
import * as process from "process";
import {authConfig} from "./config";





dotenv.config({ path: './.env' })
console.log('[TRACE] .env loaded');

async function startApp(): Promise<void> {
    try {
        const db: Db  = await connectToCoreDb({
            uri: process.env.ATLAS_URI,
            dbName: process.env.DB_NAME
        });
        const repositories = createRepositories({ db : db });
        const services = initServices({ repositories: repositories, authConfig: authConfig });
        const useCases = {};
        const controllers: AppControllers = initControllers({ useCases });
        const app: Express = express();
        initRoutes(app, { controllers });
        await startServer({ app, port: process.env.PORT })
    } catch (error: any) {
        console.error('Error starting the app:', error);
        //process.exit(1)
    }
}

await startApp();