import express from "express";
import {appManager} from "../app.js";


const calendarRouter = express.Router();

calendarRouter.get('/:date', async (req, res) => {
    try {
        res.json(await appManager.calendarService.collectData(req.params.date));
    } catch (error) {
        console.error('Error retrieving day data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export {calendarRouter};