import {playlistMiddlewares} from "../playlist/playlistMiddlewares";
import {registrationMiddlewares} from "../../../api-auth/src/middlewares/registerMiddlewares";

export const initMiddlewares = ({ services }: any): any => {
    try {
        const { registrationService, playlistTemplateService } = services;

        const middlewares = {
            registration: registrationMiddlewares({
                checkUserExistByMailFunction: (input) => registrationService.getUserLoginByEmail(input)
            }),
            playlist: playlistMiddlewares({ playlistTemplateService: services.playlistTemplateService }),
        }

        console.log('✅ initMiddleware executed');
        return middlewares;

    } catch (err) {
        console.log('[initMiddlewares error]: ', err);
    }
}