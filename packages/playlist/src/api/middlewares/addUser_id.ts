import {ObjectId} from "mongodb";
import type {NextFunction, Request, Response} from "express";

export const addUser_id = (req: Request, res: Response, next: NextFunction): void => {
    req.user_id = new ObjectId('66e6e31d450539b53874aee5')
    next();
}