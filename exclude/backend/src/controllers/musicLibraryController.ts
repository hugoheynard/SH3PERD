import type {NextFunction, Request, Response} from "express";
import {wrap_TryCatchNextErr} from "@sh3pherd/shared-utils/tryCatchs/wrap_tryCatchNextErr";

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
        },


        /**VERSIONS CRUD OPERATIONS*/
        async postVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
            const versionData = await musicService.postVersion({
                referenceMusic_id: req.body.referenceMusic_id,
                versionData: req.body.versionData
            });
            res.status(200).json({ versionData: versionData });
        },

        async updateVersion(req: Request, res: Response, next: NextFunction): Promise<any> {
            const result = await musicService.updateVersion({
                version_id: req.params.version_id,
                versionData: req.body.versionData
            });
            res.status(200).json({ result: result });
        },

        async deleteVersion(req: Request, res: Response, next: NextFunction): Promise<any> {
            const result = await musicService.deleteVersion({ version_id: req.params.version_id });
            res.status(200).json({ result: result});
        }
    };

    return wrap_TryCatchNextErr(controller);
};