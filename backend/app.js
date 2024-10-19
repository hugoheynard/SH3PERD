import dotenv from "dotenv";
import express from 'express';
import {AppManager} from "./Classes/class_AppManager.js";
import {connectDb} from "./db.js";
import {startServer} from "./server.js";
import {initRoutes} from "./initRoutes.js";

dotenv.config({ path: '../.env' });

export let app_db;
async function startApp() {
    try {
        // Connect to the database
        const db = await connectDb();
        app_db = db;  // If you need the database object globally

        // Initialize the Express app
        const app = express();

        // Initialize routes with the Express app and db
        initRoutes(app, db);

        // Start the server
        await startServer(app);

        console.log('Server started successfully');
    } catch (error) {
        console.error('Error starting the app:', error);
        process.exit(1);  // Exit the process with a failure code if something goes wrong
    }
}

startApp();


export const appManager = new AppManager(); //TODO: Singleton?
