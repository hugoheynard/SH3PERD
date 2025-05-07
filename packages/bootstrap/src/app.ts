import dotenv from "dotenv";
import express, {type Express} from 'express';
import {type Db} from "mongodb";
import * as process from "process";
import {connectToCoreDb} from "./connectToCoreDb.js";
import {createMongoRepositories} from "./createMongoRepositories.js";
import {initServices} from "./initServices.js";
import {initUseCases} from "./initUseCases.js";
import {initControllers, type AppControllers} from "./initControllers.js";
import {initRoutes} from "./initRoutes.js";
import {startServer} from "./startServer.js";
import {authConfig, secureCookieConfig} from "./config.js";
import {initGlobalMiddlewares} from "./initGlobalMiddlewares.js";
import {getMongoClient} from "./getMongoClient.js";


// Load environment variables from .env file
dotenv.config({ path: './.env' });
console.log('[TRACE] .env loaded')

async function startApp(): Promise<void> {
    try {
        /*
        const db: Db  = await connectToCoreDb({
            uri: process.env.ATLAS_URI,
            dbName: process.env.DB_NAME
        });

         */

        const mongoClient = await getMongoClient({ uri: process.env.ATLAS_URI });

        const repositories: any = createMongoRepositories({ client: mongoClient, dbName: process.env.DB_NAME});
        const services: any = initServices({ repositories, authConfig, secureCookieConfig });
        const useCases: any = initUseCases({ services, repositories });
        const controllers: any = initControllers({ useCases });
        const globalMiddlewares: any = initGlobalMiddlewares({ services });
        const app: Express = express();
        await initRoutes(app, { controllers }, { globalMiddlewares });
        await startServer({ app, port: process.env.PORT });


    } catch (error: any) {
        console.error('Error starting the app:', error);
        //process.exit(1)
    }
}

await startApp();

