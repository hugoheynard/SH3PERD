import {createAuthTokenService} from "../../auth/factories/createAuthTokenService.js";
import {CalendarService} from "../../calendar/core/services/CalendarService.js";
import {buildCalendar} from "../../calendar/core/builders/buildCalendar.js";
import {computeEventIntersections} from "../../calendar/core/colliders/computeEventIntersection.js";
import { getAuthConfig } from '../config/getAuthConfig.js';
import { secureCookieConfig } from '../config/secureCookieConfig.js';


export const createCoreServices = (input: { repositories: any }): any => {
    const { repositories } = input;

    const { refreshTokenRepository } = repositories;

    try {
        const services = {
            authTokenService: createAuthTokenService({
                findRefreshTokenFn: refreshTokenRepository.findRefreshToken,
                saveRefreshTokenFn: refreshTokenRepository.saveRefreshToken,
                deleteRefreshTokenFn: refreshTokenRepository.deleteRefreshToken,
                deleteAllRefreshTokensForUserFn: refreshTokenRepository.deleteAllRefreshTokensForUser,
                authConfig: getAuthConfig(),
                secureCookieConfig
            }),
            calendarService: new CalendarService({
                buildCalendarFn: buildCalendar,
                colliderRegistry: {
                    eventIntersection: computeEventIntersections,
                }
            })
        };
        console.log('✅ [SH3PHERD]: Core Services ready');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}