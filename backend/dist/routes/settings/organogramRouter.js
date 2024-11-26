import express, {} from "express";
export const organogramRouter = (settingsController) => {
    const router = express.Router();
    router.get('/id/:id', settingsController.getOrganogram);
    router.put('/', settingsController.updateOrganogram);
    return router;
};
//# sourceMappingURL=organogramRouter.js.map