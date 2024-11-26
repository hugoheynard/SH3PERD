import type {Router} from "express";
import express from "express";

export const eventsRouter = (eventsController): Router => {
    const router: Router = express.Router();

    router.post('/search', eventsController.eventSearch);
    router.get('/', eventsController.getEventById);
    router.post('/', eventsController.postEvent);

    return router;
}