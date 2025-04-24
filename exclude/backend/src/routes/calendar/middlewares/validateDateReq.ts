import {type NextFunction, type Request, type Response} from "express";

export const validateDateReq = (req: Request, res:Response, next:NextFunction): void => {
    const { date } = req.body;

    try {
        if (!date) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            res.status(400).json({ error: 'Invalid date format' });
            return;
        }

        next(req);
    } catch (err) {
        next(err);
    }
};