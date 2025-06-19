import { createAuthTokenService } from '../../auth/factories/createAuthTokenService.js';
import { CalendarService } from '../../calendar/core/services/CalendarService.js';
import { buildCalendar } from '../../calendar/core/builders/buildCalendar.js';
import { computeEventIntersections } from '../../calendar/core/colliders/computeEventIntersection.js';
import { getAuthConfig } from '../config/getAuthConfig.js';
import { secureCookieConfig } from '../config/secureCookieConfig.js';
import type { IAuthTokenService } from '../../auth/types/auth.core.tokens.contracts.js';
import type { TCoreRepositories } from './createCoreRepositories.js';

export type TCoreServices = {
  authTokenService: IAuthTokenService;
  calendarService: CalendarService;
};

export const createCoreServices = (input: { repositories: TCoreRepositories }): TCoreServices => {
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
        secureCookieConfig,
      }),
      calendarService: new CalendarService({
        buildCalendarFn: buildCalendar,
        colliderRegistry: {
          eventIntersection: computeEventIntersections,
        },
      }),
    };
    return services;
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`Failed to initialize core services: ${e.message}`);
    }
    throw new Error('Failed to initialize core services: unknown error');
  }
};
