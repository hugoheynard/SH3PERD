import express, {type Router} from "express";

export const organogramRouter = (settingsController: any): Router => {
    const router: Router = express.Router()

    router.get('/id/:id', settingsController.getOrganogram);
    router.put('/', settingsController.updateOrganogram);

    return router;
}