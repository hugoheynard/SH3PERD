import {checkPlaylistTemplate} from "./middlewares/checkPlaylistTemplate";

export const playlistMiddlewares = (input: { playlistTemplateService: any}): any => {
    try {
        const pltService = input.playlistTemplateService;

        return {
            checkPlaylistTemplate: checkPlaylistTemplate({
                getPlaylistTemplateFunction: pltService.getPlaylistTemplates
            }),
        }

    } catch(err) {
        console.log('[playlistMiddlewares error]: ', err);
    }
}