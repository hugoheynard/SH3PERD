import type {Router} from "express";
import express from "express";


export const playlistRouter = (plControl: any , plMidWare: any): Router => {

    const playlistRouter: Router = express.Router();
    const playlistTemplateRouter: Router = express.Router();

    /**
    * CRUD for playlists
     */
    playlistRouter.get('/', plControl.getPlaylists);
    playlistRouter.post('/', plControl.postPlaylist);
    playlistRouter.put('/:id', plControl.updatePlaylist);
    playlistRouter.delete('/:id', plControl.deletePlaylist);

    playlistRouter.get('/new', plControl.getDefaultPlaylist);
    playlistRouter.get(
        '/new/fromTemplate/:playlistTemplate_id',
        plMidWare.checkPlaylistTemplate,
        plControl.getNewPlaylistFromTemplate);



    playlistRouter.use('/template', playlistTemplateRouter);
    playlistTemplateRouter.get('/', plControl.getPlaylistTemplates);
    playlistTemplateRouter.post('/', plControl.postPlaylistTemplate);
    playlistTemplateRouter.put('/:id', plControl.updatePlaylistTemplate);
    playlistTemplateRouter.delete('/:id', plControl.deletePlaylistTemplate);

    return playlistRouter;
}