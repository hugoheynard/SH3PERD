import express, {type Router} from "express";
import {companySettingsRouter} from "./companySettingsRouter";


export const settingsRouter = (settingsController: any): Router => {
    const router = express.Router();

    router.use('/company', companySettingsRouter(settingsController));

    return router;
};
