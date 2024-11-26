import express, {} from "express";
import { companySettingsRouter } from "./companySettingsRouter.js";
export const settingsRouter = (settingsController) => {
    const router = express.Router();
    router.use('/company', companySettingsRouter(settingsController));
    return router;
};
//# sourceMappingURL=settingsRouter.js.map