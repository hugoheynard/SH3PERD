import {checkPlaylistTemplate} from "./middlewares/checkPlaylistTemplate.js";

export const playlistMiddlewares = (input: { playlistTemplateService: any}): any => {
    try {
        const pltService = input.playlistTemplateService;

        return {
            checkPlaylistTemplate: checkPlaylistTemplate({
                getPlaylistTemplateFn: pltService.getPlaylistTemplates
            }),
        }

    } catch(err) {
        console.log('[playlistMiddlewares error]: ', err);
    }
}