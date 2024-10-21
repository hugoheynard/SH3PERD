import express from "express";

export const staffRouter = staffController => {
    const router = express.Router();

    router.get('/id',
        async(req, res, next) => {
        const { id } = req.body;

        const response = await staffController.getSingleStaff_byId(id);
    });

    return router;
};