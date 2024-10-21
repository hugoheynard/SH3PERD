import {appManager} from "../../app.js";
import {calendarRouter} from "./dateRouter.js";

const postEventRoute = () => {
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
}