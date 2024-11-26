import express, {type Router} from "express";

export const weekTemplateRouter = (settingsController: any): Router => {
    const router: Router = express.Router();

    router.get('/id/:id', settingsController.getWeekTemplate);
    router.put('/', settingsController.updateWeekTemplate);

    return router;
};