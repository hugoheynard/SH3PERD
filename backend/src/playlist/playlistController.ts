import {wrap_TryCatchNextErr} from "../controllers/utilities/wrap_tryCatchNextErr";
import type {IPlaylistController} from "./interfaces/IPlaylistController";


export const playlistController = (input: IPlaylistController['input']): IPlaylistController['output'] => {
    const { playlistService, playlistTemplateService } = input;

    const controller: IPlaylistController['output'] = {

        /**
         * general CRUD playlist opérations
         */
        async getPlaylists(req, res, next ) {
            const playlist = await playlistService.getPlaylist();
            return res.status(200).json({ playlist });
        },

        async postPlaylist(req, res, next) {
            const result = await playlistService.postPlaylist({
                user_id : req.user_id,
                playlistData : req.body.playlistData
            });
            return res.status(201).json(result);
        },

        async updatePlaylist(req, res, next) {
            const result = await playlistService.updatePlaylist({
                user_id : req.user_id,
                playlist_id : req.params.id,
                playlistData : req.body.playlistData,
            });
            return res.status(204).json(result);
        },

        async deletePlaylist(req, res, next) {
            const result = await playlistService.deletePlaylist({ playlist_id: req.params.id });
            return res.status(204).json(result);
        },


        //special playlist operations
        async getDefaultPlaylist(req, res, next){
            const defaultPlaylist = await playlistService.getDefaultPlaylist();
            return res.status(200).json({ playlist: defaultPlaylist });
        },

        async getNewPlaylistFromTemplate(req, res, next) {
            const playlistFromTemplate = await playlistService.getNewPlaylistFromTemplate({ playlistTemplate: req.body.playlistTemplate });
            return res.status(200).json({ playlist: playlistFromTemplate });
        },







        //CRUD playlist template operations
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