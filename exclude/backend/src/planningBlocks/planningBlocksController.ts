import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "@sh3pherd/shared-utils/tryCatchs/wrap_tryCatchNextErr";


export const planningBlocksController = (input: any): any => {
    const planningBlocksService = input.planningBlocksService;

    const controller =  {
        async eventSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
            res.status(200).json(await planningBlocksService.eventSearch({ queryParams: req.body.eventSearchParams }));
        },

        async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
            res.status(200).json(await planningBlocksService.getEventById({id: req.query.id}));
        },

        async postEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
            const insertResult = await planningBlocksService.postEvent({ eventData: req.body.eventData });
            res.status(200).json(insertResult)
        }
    }


    return wrap_TryCatchNextErr(controller)
};