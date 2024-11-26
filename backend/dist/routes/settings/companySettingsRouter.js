import express, { Router } from "express";
import { weekTemplateRouter } from "./weekTemplateRouter.js";
import { organogramRouter } from "./organogramRouter.js";
export const companySettingsRouter = (settingsController) => {
    const router = express.Router();
    router.use('/weekTemplate', weekTemplateRouter(settingsController));
    router.use('/organogram', organogramRouter(settingsController));
    return router;
};
//# sourceMappingURL=companySettingsRouter.js.map