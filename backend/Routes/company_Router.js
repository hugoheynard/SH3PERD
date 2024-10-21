import express from "express";


export const companyRouter = express.Router();

companyRouter.get('/settings', async (req, res)=> {
    try {
        //const result = await app_db.collection('company').findOne(
        //    { name: 'La Folie Douce Les Arcs'},
        //    { projection: { 'settings': 1, _id: 0 } }
        //);

        //res.send(result.settings)

    } catch (error) {
        console.error('Error retrieving day data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})