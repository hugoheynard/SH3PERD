import type {Router} from "express";
import express from "express";

export const planningBlocksRouter = (planningBlocksController: any): Router => {
    const router: Router = express.Router();

    router.post('/search', planningBlocksController.eventSearch);
    router.get('/', planningBlocksController.getEventById);
    router.post('/', planningBlocksController.postEvent);

    return router;
}