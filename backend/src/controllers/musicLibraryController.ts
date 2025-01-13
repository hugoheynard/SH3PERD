import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "./utilities/wrap_tryCatchNextErr";

export const musicLibraryController = (input: any): any => {
    const { musicService } = input;

    const controller = {
        async getMusicLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
            const musicLibraryData = await musicService.getMusicLibrary();
            res.status(200).json({ musicLibraryData: musicLibraryData });
        },

        async postMusic(req: Request, res: Response, next: NextFunction): Promise<void> {
            const musicData = await musicService.postMusic({ musicData: req.body.data });
            res.status(200).json({ musicData: musicData });
        },

        async updateMusic() {

        },

        async deleteMusic(req: Request, res: Response, next: NextFunction): Promise<void> {
            const result = await musicService.deleteMusic({ music_id: req.params.music_id });
            res.status(200).json({ result: result });
        }
    };

    return wrap_TryCatchNextErr(controller)
};