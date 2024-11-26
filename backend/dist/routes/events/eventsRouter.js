import express from "express";
export const eventsRouter = (eventsController) => {
    const router = express.Router();
    router.post('/search', eventsController.eventSearch);
    router.get('/', eventsController.getEventById);
    router.post('/', eventsController.postEvent);
    return router;
};
//# sourceMappingURL=eventsRouter.js.map