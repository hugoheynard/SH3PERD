import {playlistMiddlewares} from "../playlist/playlistMiddlewares";

export const initMiddlewares = ({ services }: any): any => {
    try {
        return {
           playlist: playlistMiddlewares({ playlistTemplateService: services.playlistTemplateService }),
        }

    } catch (err) {
        console.log('[initMiddlewares error]: ', err);
    }
}