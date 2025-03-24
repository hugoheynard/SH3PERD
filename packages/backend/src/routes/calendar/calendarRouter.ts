import express, {Router} from "express";
import {dateRouter} from "./dateRouter";


export const calendarRouter = (calendarController: any): Router => {
    const router: Router = express.Router();

    router.post('/',
        //verifyAuthToken,
        // validateDateReq,//reqDateIsInContractDates,
        calendarController.getCalendarData
    )

    //TODO ajouter middleware token auth
    //router.use('/date', dateRouter(calendarController));

    return router;
};