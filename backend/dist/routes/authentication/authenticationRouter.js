import express, {} from "express";
import { loginRouter } from "./loginRouter.js";
import { autoLogRouter } from "./autoLogRouter.js";
import { registerRouter } from "./registerRouter.js";
export const authenticationRouter = (loginController) => {
    const { login, autoLog } = loginController;
    const router = express.Router();
    router.use('/login', loginRouter(login));
    router.use('/autoLog', autoLogRouter(autoLog));
    router.use('/register', registerRouter());
    return router;
};
//# sourceMappingURL=authenticationRouter.js.map