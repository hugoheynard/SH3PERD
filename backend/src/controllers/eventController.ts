import type {Request, Response} from "express";
import {wrap_TryCatchNextErr} from "./utilities/wrap_tryCatchNextErr";


export const eventsController = (input: any): any => {
    const eventService = input.eventService;

    const controller =  {
        async eventSearch(req: Request, res: Response): Promise<void> {
            res.status(200).json(await eventService.eventSearch({ queryParams: req.body.eventSearchParams }));
        },

        async getEventById(req: Request, res: Response): Promise<void> {
            res.status(200).json(await eventService.getEventById({id: req.query.id}));
        },

        async postEvent(req: Request, res: Response): Promise<void> {
            res.status(200).json(await eventService.postEvent())
        }

    }


    return wrap_TryCatchNextErr(controller)
};