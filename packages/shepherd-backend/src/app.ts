import express, {type Express} from 'express';
import * as process from "process";
import {createMongoRepositories} from "./bootstrap/createMongoRepositories.js";
import {initServices} from "./bootstrap/initServices.js";
import {initUseCases} from "./bootstrap/initUseCases.js";
import {initControllers, type AppControllers} from "./bootstrap/initControllers.js";
import {initRoutes} from "./bootstrap/initRoutes.js";
import {startServer} from "./bootstrap/startServer.js";
import {authConfig, secureCookieConfig} from "./bootstrap/config.js";
import {initGlobalMiddlewares} from "./bootstrap/initGlobalMiddlewares.js";
import {getMongoClient} from "./bootstrap/getMongoClient.js";
import {loadEnv} from "./bootstrap/loadEnv.js";


// Load environment variables from .env.app, override with .dev / prod
loadEnv(process.env.NODE_ENV || 'dev');

async function startApp(): Promise<void> {
    try {
        const mongoClient = await getMongoClient({ uri: process.env.ATLAS_URI });

        const repositories: any = createMongoRepositories({ client: mongoClient, dbName: process.env.DB_NAME});
        const services: any = initServices({ repositories, authConfig, secureCookieConfig });
        const useCases: any = initUseCases({ services, repositories });
        const controllers: any = initControllers({ useCases });
        const globalMiddlewares: any = initGlobalMiddlewares({ services });
        const app: Express = express();
        await initRoutes(app, { controllers }, { globalMiddlewares }, { useCases });
        await startServer({ app, port: process.env.PORT });


    } catch (error: any) {
        console.error('Error starting the app:', error);
        //process.exit(1)
    }
}

await startApp();

