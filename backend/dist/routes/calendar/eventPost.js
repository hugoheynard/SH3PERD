import express from "express";
const postEventRoute = () => {
    const router = express.Router();
    router.post('/events', async (req, res) => {
        try {
            const processData = null; //await appManager.calendarController.postEvent(req.body);
            if (!processData) {
            }
            res.status(201).json({
                message: 'Event created with success',
                //event: eventData
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error while adding event'
            });
            throw (e);
        }
    });
    return router;
};
//# sourceMappingURL=eventPost.js.map