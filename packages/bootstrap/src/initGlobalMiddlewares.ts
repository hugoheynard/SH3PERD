import {verifyAuthToken} from "@sh3pherd/auth";
import {TechnicalError} from "@sh3pherd/shared-utils";


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