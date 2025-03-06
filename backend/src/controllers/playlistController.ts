import {wrap_TryCatchNextErr} from "./utilities/wrap_tryCatchNextErr";
import type {NextFunction, Request, Response} from "express";
import type {InsertOneResult} from "mongodb";
import type {PlaylistTemplateDocument} from "../services/playlistService/playlistTemplateService";
import type {PlaylistTemplateService} from "../../../shared/interfaces/mongoDocuments/playlistTemplateInterfaces";

export interface PlaylistController {
    input: {
        playlistTemplateService: PlaylistTemplateService;
        playlistService: any;
    },
    output: {
        [key: string]: any;
    }
}

export const playlistController = (input: PlaylistController['input']): PlaylistController['output'] => {
    const { playlistService, playlistTemplateService } = input;

    const controller: PlaylistController['output'] = {

        async postPlaylistTemplate(req: Request, res: Response, next: NextFunction): Promise<InsertOneResult<PlaylistTemplateDocument>> {
            const templateData = await playlistTemplateService.postPlaylistTemplate({ playlistTemplateData: req.body.data });
            res.status(200).json({ playlistTemplateData: templateData });
        },
    };

    return wrap_TryCatchNextErr(controller);
};