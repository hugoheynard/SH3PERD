import express from "express";
import {appManager} from "../app.js";


export const calendarRouter = express.Router();

calendarRouter.get('/:date', async (req, res) => {
    try {
        res.json(await appManager.calendarController.collectData(req.params.date));
    } catch (error) {
        console.error('Error retrieving day data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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