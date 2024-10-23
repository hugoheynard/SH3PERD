import dotenv from "dotenv";
import express from 'express';
import {connectDb} from "./db.js";
import {initServices} from "./initServices.js";
import {initControllers} from "./initControllers.js";
import {initRoutes} from "./initRoutes.js";
import {startServer} from "./server.js";


dotenv.config({ path: '../.env' });

async function startApp() {
    try {
        const db = await connectDb();
        const app = express();
        const services = initServices({ db });
        const controllers = initControllers({ services });
        initRoutes(app, { db, controllers });
        await startServer(app);

    } catch (error) {
        console.error('Error starting the app:', error);
        process.exit(1);
    }
}

await startApp();