import express, { Router } from "express";
import { dateRouter } from "./dateRouter.js";
export const calendarRouter = (calendarController) => {
    const router = express.Router();
    router.post('/', 
    //verifyAuthToken,
    // validateDateReq,//reqDateIsInContractDates,
    calendarController.getCalendarData);
    //TODO ajouter middleware token auth
    //router.use('/date', dateRouter(calendarController));
    return router;
};
//# sourceMappingURL=calendarRouter.js.map