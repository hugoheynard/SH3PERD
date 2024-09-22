import express from "express";
import {appManager} from "../app.js";


const calendarRouter = express.Router();

calendarRouter.get('/:date', async (req, res) => {
    try {
        await appManager.calendarService.build(req.params.date)
        res.json(await appManager.calendarService);
    } catch (error) {
        console.error('Error retrieving day data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export {calendarRouter};