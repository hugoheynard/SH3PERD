import express, {} from "express";
import { validateAuthInput } from "./middlewares/validateAuthInput.js";
export const loginRouter = (loginFunc) => {
    const router = express.Router();
    router.post('/', validateAuthInput, loginFunc);
    return router;
};
//# sourceMappingURL=loginRouter.js.map