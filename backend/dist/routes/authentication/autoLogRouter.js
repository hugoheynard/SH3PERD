import express, {} from "express";
export const autoLogRouter = (autoLogFunction) => {
    const router = express.Router();
    router.post('/', autoLogFunction);
    return router;
};
//# sourceMappingURL=autoLogRouter.js.map