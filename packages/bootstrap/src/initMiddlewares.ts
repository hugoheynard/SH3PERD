//import {playlistMiddlewares} from "@sh3pherd/backend/playlist/playlistMiddlewares";
import {createRegisterMiddlewares, validateRegistrationInput} from "@sh3pherd/auth";

export const initMiddlewares = ({ services }: any): any => {
    try {
        const { /*registerService, playlistTemplateService*/ } = services;

        const middlewares = {
            registration: createRegisterMiddlewares({
                validateRegistrationInput: validateRegistrationInput,
                //checkUserExistByMailFunction: (input) => registerService.getUserByEmail(input)
            }),
            //playlist: playlistMiddlewares({ playlistTemplateService: services.playlistTemplateService }),
        }

        console.log('✅ initMiddleware executed');
        return middlewares;

    } catch (err) {
        console.log('[initMiddlewares error]: ', err);
    }
}