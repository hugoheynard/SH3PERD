import {AppManager} from "./Classes/class_AppManager.js";
import express from 'express';
import cors from 'cors';
import {calendarRouter} from "./Routes/calendar_Router.js";
import {musicLibraryRouter} from "./Routes/musicLibrary_Routes.js";
import {MongoClient} from "mongodb";
import {atlas_uri} from "./appServer_dbConnections/atlas_uri.js";
import {companySettings_Router} from "./Routes/settings_Router.js";
import {companyRouter} from "./Routes/company_Router.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect db and start the server
const mongoClient = new MongoClient(atlas_uri);
export const app_db = mongoClient.db('shepherd');

try {
    await app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (err) {
    console.log(err);
}

// middlewares
app.use(cors());
app.use(express.json());

//Routers
app.use('/company', companyRouter);
app.use('/calendar', calendarRouter);
app.use('/musicLibrary', musicLibraryRouter);
app.use('/company/settings', companySettings_Router);

app.use((req, res, next) => {
    res.status(404).send('Route does not exist');
});


export const appManager = new AppManager(); //TODO: Singleton?