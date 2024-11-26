import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "./utilities/wrap_tryCatchNextErr";


export const calendarController  = (input: any): any => {
    const { calendarService } = input

    const controller = {

        async getCalendarData(req: Request, res: Response, next: NextFunction): Promise<void> {
            const calendarData = await calendarService.getCalendarData({
                date: req.body.date,
                staffMembers: req.body.staffMembers
            })
            res.status(200).json(calendarData);
        }
    };

    return wrap_TryCatchNextErr(controller)
}