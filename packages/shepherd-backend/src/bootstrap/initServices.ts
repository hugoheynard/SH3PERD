import type {TAuthConfig} from "../auth/types/auth.domain.config.js";
import type {TSecureCookieConfig} from "../auth/types/auth.domain.tokens.js";
import {createAuthTokenService} from "../auth/factories/createAuthTokenService.js";
import {CalendarService} from "../calendar/core/services/CalendarService.js";
import {buildCalendar} from "../calendar/core/builders/buildCalendar.js";
import {computeEventIntersections} from "../calendar/core/colliders/computeEventIntersection.js";


export const initServices = (input: { repositories: any, authConfig: TAuthConfig, secureCookieConfig: TSecureCookieConfig }): any => {
    const { repositories, authConfig, secureCookieConfig } = input;

    const { refreshTokenRepository } = repositories;

    try {
        const services = {
            authTokenService: createAuthTokenService({
                findRefreshTokenFn: refreshTokenRepository.findRefreshToken,
                saveRefreshTokenFn: refreshTokenRepository.saveRefreshToken,
                deleteRefreshTokenFn: refreshTokenRepository.deleteRefreshToken,
                deleteAllRefreshTokensForUserFn: refreshTokenRepository.deleteAllRefreshTokensForUser,
                authConfig,
                secureCookieConfig
            }),
            calendarService: new CalendarService({
                buildCalendarFn: buildCalendar,
                colliderRegistry: {
                    eventIntersection: computeEventIntersections,
                }
            })

        };
        console.log('✅ initServices executed');
        return services;

    } catch (e: any) {
        console.error('Error during controller services:', e);
        throw new Error('Failed to initialize services');
    }
}