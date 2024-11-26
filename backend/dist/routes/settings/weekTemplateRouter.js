import express, {} from "express";
export const weekTemplateRouter = (settingsController) => {
    const router = express.Router();
    router.get('/id/:id', settingsController.getWeekTemplate);
    router.put('/', settingsController.updateWeekTemplate);
    return router;
};
//# sourceMappingURL=weekTemplateRouter.js.map