import {playlistMiddlewares} from "@sh3pherd/backend/playlist/playlistMiddlewares";
import {registrationMiddlewares} from "@sh3pherd/api-auth/middlewares/registerMiddlewares";

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