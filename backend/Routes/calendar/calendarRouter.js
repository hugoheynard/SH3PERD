import express from "express";
import {dateRouter} from "./dateRouter.js";

export const calendarRouter = calendarController => {
    const router = express.Router();

    //TODO ajouter middleware token auth
    router.use('/date', dateRouter(calendarController));

    return router;
};