import type {NextFunction, Request, Response} from "express";
import type {IPlaylistController} from "../types/playlist.api.types.js";


export const playlistControllerOld = (input: IPlaylistController['input']): IPlaylistController['output'] => {
    const { playlistService, playlistTemplateService } = input;

    const controller: IPlaylistController['output'] = {

        /**
         * general CRUD playlist opérations
         */
        getPlaylists: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const playlist = await playlistService.getPlaylist();
            res.status(200).json({ playlist });
        },

        postPlaylist: async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
            const result = await playlistService.postPlaylist({
                user_id : req.user_id,
                playlistData : req.body.playlistData
            });
            res.status(201).json(result);
        },

        updatePlaylist: async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
            const result = await playlistService.updatePlaylist({
                user_id : req.user_id,
                playlist_id : req.params.id,
                playlistData : req.body.playlistData,
            });
            res.status(204).json(result);
        },

        deletePlaylist: async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
            console.log(req.params.id);
            const deleteResult = await playlistService.deletePlaylist({ playlist_id: req.params.id });
            res.status(204).json(deleteResult);
        },


        /**
         * special playlist operations
         */
        getDefaultPlaylist: async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
            const defaultPlaylist = await playlistService.getDefaultPlaylist();
            res.status(200).json({ playlist: defaultPlaylist });
        },

        getNewPlaylistFromTemplate: async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
            const playlistFromTemplate = await playlistService.getNewPlaylistFromTemplate({ playlistTemplate: req.body.playlistTemplate });
            res.status(200).json({ playlist: playlistFromTemplate });
        },


        /**
         * CRUD playlist template operations
         */
        async getPlaylistTemplates(req: Request, res: Response, next: NextFunction): Promise<void>{
            const templates = await playlistTemplateService.getPlaylistTemplates();
            res.status(200).json({ playlistTemplates: templates });
        },

        async postPlaylistTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
            const insertOneResult = await playlistTemplateService.postPlaylistTemplate({ playlistTemplateData: req.body.data });
            res.status(201).json(insertOneResult);
        },

        async updatePlaylistTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
            const updateResult = await playlistTemplateService.updatePlaylistTemplate({ playlistTemplateData: req.body.data });
            res.status(204).json(updateResult);
        },

        async deletePlaylistTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
            const deleteResult = await playlistTemplateService.deletePlaylistTemplate({ playlistTemplate_id: req.body.playlistTemplate_id });
            res.status(204).json(deleteResult);
        }
    };

    return controller;
};