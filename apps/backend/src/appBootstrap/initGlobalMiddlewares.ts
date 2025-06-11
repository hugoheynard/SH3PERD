import {verifyAuthToken} from "../auth/api/middlewares/verifyAuthToken.js";
import {TechnicalError} from "../utils/errorManagement/errorClasses/TechnicalError.js";


export const initGlobalMiddlewares = (input: { services: any}): any => {
    try {

        return {
            verifyAuthToken: verifyAuthToken({ verifyAuthTokenFn: input.services.authTokenService.verifyAuthToken })
        }
    } catch (error) {
        throw new TechnicalError(
            'Failed to initialize global middlewares',
            `initGlobalMiddlewares, ${error}`,
            500
        );
    }
};