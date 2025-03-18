import type {Router} from "express";
import express from "express";


export const playlistRouter = (plControl: any , plMidWare: any): Router => {

    const playlistRouter: Router = express.Router();
    const playlistTemplateRouter: Router = express.Router();


    playlistRouter.get('/', plControl.getPlaylist);
    playlistRouter.get('/new', plControl.getDefaultPlaylist);
    playlistRouter.get(
        '/new/fromTemplate/:playlistTemplate_id',
        plMidWare.checkPlaylistTemplate,
        plControl.getNewPlaylistFromTemplate);


    //playlistRouter.post('/', , plControl.postPlaylist);


    playlistRouter.use('/template', playlistTemplateRouter);
    playlistTemplateRouter.get('/', plControl.getPlaylistTemplates);
    playlistTemplateRouter.post('/', plControl.postPlaylistTemplate);
    playlistTemplateRouter.put('/:id', plControl.updatePlaylistTemplate);
    playlistTemplateRouter.delete('/:id', plControl.deletePlaylistTemplate);

    return playlistRouter;
}