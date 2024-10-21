import express from "express";
import { validateDateReq } from "./middlewares/validateDateReq.js";


export const dateRouter = calendarController => {
    const router = express.Router();

    router.post('/',
        validateDateReq,
        async (req, res) => {
            const { date } = req.body;

            try {
                const data = await calendarController.collectData(date);

                return res.status(200).json({
                    success: true,
                    receivedDate: date,
                    data: data
                });
            } catch (error) {
                console.error("Internal error while getting calendar day data:", error);

                return res.status(500).json({
                    success: false,
                    message: 'Internal error while getting calendar day data',
                    error: error.message,
                    stack: error.stack,
                    receivedDate: date,
                });
            }
        });
    return router;
};