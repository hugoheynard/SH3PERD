import express from "express";
import {app_db} from "../app.js";

export const companySettings_Router = express.Router();

companySettings_Router.get('/events', async (req, res) => {
    try {
        const result = await app_db.collection('companies').findOne(
            { name: 'La Folie Douce Les Arcs'},
            { projection: { 'settings.events': 1, _id: 0 } }
        );

        res.send(result.settings.events)

    } catch (error) {
        console.error('Error retrieving day data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});