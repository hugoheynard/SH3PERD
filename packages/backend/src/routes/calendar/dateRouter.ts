import express, {Router} from "express";
import {verifyAuthToken} from "../middlewares/verifyAuthToken";


export const dateRouter = (calendarController: any): Router => {
    const router = express.Router();

    router.post('/',
        //verifyAuthToken,
        //validateDateReq,
        //reqDateIsInContractDates,
        async (req, res) => {
            const {date} = req.body;

            try {
                const data = await calendarController.collectData(req);

                res.status(200).json({
                    success: true,
                    receivedDate: date,
                    data: data
                });
                return;
            } catch (error: any) {
                console.error("Internal error while getting calendarPage day data:", error);

                res.status(500).json({
                    success: false,
                    message: 'Internal error while getting calendarPage day data',
                    error: error.message,
                    stack: error.stack,
                    receivedDate: date,
                });
                return;
            }
        });
    return router;
};