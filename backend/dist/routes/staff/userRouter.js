import express, {} from "express";
export const userRouter = (staffController) => {
    const router = express.Router();
    router.post('/id', async (req, res, next) => {
        const { id } = req.body;
        //const response = await staffController.getSingleStaff_byId(id);
    });
    return router;
};
//# sourceMappingURL=userRouter.js.map