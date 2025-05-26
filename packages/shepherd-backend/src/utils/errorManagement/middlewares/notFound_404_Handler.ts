import type {RequestHandler} from 'express';

export const notFound_404_Handler: RequestHandler = (req, res) => {
    console.log(`[404] ${req.method} ${req.originalUrl}`);

    res.status(404).json({ error: true, message: 'Route does not exist' });
    return;

};
