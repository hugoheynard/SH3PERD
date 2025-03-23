import {playlistMiddlewares} from "../playlist/playlistMiddlewares";
import {registrationMiddlewares} from "../registration/registrationMiddleware";

export const initMiddlewares = ({ services }: any): any => {
    try {

        return {
            registration: registrationMiddlewares({
                checkUserExistByMailFunction: services.registrationService.getUserLoginByEmail
            }),
            playlist: playlistMiddlewares({ playlistTemplateService: services.playlistTemplateService }),
        }

    } catch (err) {
        console.log('[initMiddlewares error]: ', err);
    }
}