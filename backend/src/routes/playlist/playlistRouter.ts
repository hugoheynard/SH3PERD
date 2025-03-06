import type {Router} from "express";
import express from "express";
import { type PlaylistController } from "../../controllers/playlistController";

export const playlistRouter = (playlistController: any): Router => {

    const router: Router = express.Router();
    const playlistRouter: Router = express.Router();
    const playlistTemplateRouter: Router = express.Router();

    router.use('/playlist', playlistRouter);



    router.use('/template', playlistTemplateRouter);
    playlistTemplateRouter.post('/', playlistController.postPlaylistTemplate);

    return router;
}