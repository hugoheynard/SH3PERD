import {wrap_TryCatchNextErr} from "../controllers/utilities/wrap_tryCatchNextErr";
import type {NextFunction, Request, Response} from "express";
import type {DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import type {PlaylistTemplateDocument} from "./playlistTemplateService";
import type {PlaylistTemplateService} from "../../../shared/interfaces/mongoDocuments/playlistTemplateInterfaces";

export interface PlaylistController {
    input: {
        playlistTemplateService: PlaylistTemplateService;
        playlistService: any;
    },
    output: {
        getPlaylistTemplates: (req: Request, res: Response, next: NextFunction) => Promise<PlaylistTemplateDocument[]>;
        postPlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<InsertOneResult<PlaylistTemplateDocument>>;
        updatePlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<UpdateResult<PlaylistTemplateDocument>>;
        deletePlaylistTemplate: (req: Request, res: Response, next: NextFunction) => Promise<DeleteResult>;
        [key: string]: any;
    }
}

export const playlistController = (input: PlaylistController['input']): PlaylistController['output'] => {
    const { playlistService, playlistTemplateService } = input;

    const controller: PlaylistController['output'] = {

        async testPlaylistModule(req, res, next) {
          res.status(200).json(playlistService.getEmptyPlaylistFromTemplate())
        },

        async getPlaylist(req, res, next) {},

        async postPlaylist(req, res, next) {

            const body = req.body;
            const { usePlaylistTemplate, playlistTemplate  } = body;

            if (usePlaylistTemplate) {
                const playlistFromTemplateSettings = await playlistService.generateEmptyPlaylistFromTemplate({ playlistTemplate: playlistTemplate });
                //res.status(201).json(playlistFromTemplateSettings);
            }
            //do regular post playlist
            //res.status(201).json(await playlistService.postPlaylist({ playlistData: body.playlistData }));
        },

        async getPlaylistTemplates(req, res, next){
            const templates = await playlistTemplateService.getPlaylistTemplates({ playlistTemplate_id : req.params.id });
            res.status(200).json({ playlistTemplates: templates });
        },

        async postPlaylistTemplate(req, res, next) {
            const templateData = await playlistTemplateService.postPlaylistTemplate({ playlistTemplateData: req.body.data });
            res.status(201).json({ playlistTemplateData: templateData });
        },

        async updatePlaylistTemplate(req, res, next) {
            const templateData = await playlistTemplateService.updatePlaylistTemplate({ playlistTemplateData: req.body.data });
            res.status(204).json({ playlistTemplateData: templateData });
        },

        async deletePlaylistTemplate(req, res, next) {
            const templateData = await playlistTemplateService.deletePlaylistTemplate({ playlistTemplate_id: req.body.playlistTemplate_id });
            res.status(204).json();
        }
    };

    return wrap_TryCatchNextErr(controller);
};