import {createRegisterService} from "./initServices/createRegisterService";
import {createAuthTokenService} from "./initServices/createAuthTokenService";



export const initServices = (input: { repositories: any, authConfig: any }): any => {
    const { repositories, authConfig } = input;

    try {
        const services = {
            registerService: createRegisterService({ userRepository: repositories.userRepo }),
            authTokenService: createAuthTokenService({ refreshTokenRepository: repositories.refreshTokenRepo, authConfig: authConfig }),

        };
        console.log('✅ initServices executed');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}