import express, {Router} from "express";
import {weekTemplateRouter} from "./weekTemplateRouter";
import {organogramRouter} from "./organogramRouter";

export const companySettingsRouter = (settingsController: any): Router => {
    const router = express.Router();

    router.use('/weekTemplate', weekTemplateRouter(settingsController));
    router.use('/organogram', organogramRouter(settingsController));

    return router;
};