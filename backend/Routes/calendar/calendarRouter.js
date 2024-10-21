import express from "express";
import {dateRouter} from "./dateRouter.js";

export const calendarRouter = calendarController => {
    const calendarRouter = express.Router();

    //TODO ajouter middleware token auth
    calendarRouter.use('/date', dateRouter(calendarController));

    return calendarRouter;
};