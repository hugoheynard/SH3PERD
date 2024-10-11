import express from "express";
import {appManager} from "../app.js";
export const calendarRouter = express.Router();

const validateDate = (req, res, next) => {
    const { date } = req.body;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    next();
};

calendarRouter.post('/date', validateDate, async (req, res) => {
    try {
        return res.json({
            success: true,
            receivedDate: req.body.date,
            data: await appManager.calendarController.collectData(req.body.date)
        });
    } catch (error) {
        console.error("Internal error while getting calendar day data:", error);

        return res.status(500).json({
            success: false,
            message: 'Internal error while getting calendar day data',
            error: error.message,
            stack: error.stack,
            receivedDate: req.body.date,
        });
    }
});

calendarRouter.post('/events', async (req, res) => {
    try {
        const processData = await appManager.calendarController.postEvent(req.body);

        if (!processData) {

        }

        res.status(201).json({
            message: 'Event created with success',
            //event: eventData
        });

    } catch (e){
        console.error(e);
        res.status(500).json({
            message: 'Internal server error while adding event'
        })
        throw (e);
    }
})

