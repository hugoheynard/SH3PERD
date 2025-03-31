import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "@sh3pherd/shared-utils/tryCatchs/wrap_tryCatchNextErr";


export const calendarController  = (input: any): any => {
    const { calendarService } = input;

    const controller = {

        async getCalendarData(req: Request, res: Response, next: NextFunction): Promise<void> {
            const calendarData = await calendarService.getCalendarData(req.body.calendarDataRequest)
            res.status(200).json({ calendarData: calendarData });
        }
    };

    return wrap_TryCatchNextErr(controller);
};