import { createAuthTokenService } from '../../auth/factories/createAuthTokenService.js';
import { CalendarService } from '../../calendar/core/services/CalendarService.js';
import { buildCalendar } from '../../calendar/core/builders/buildCalendar.js';
import { computeEventIntersections } from '../../calendar/core/colliders/computeEventIntersection.js';
import { getAuthConfig } from '../config/getAuthConfig.js';
import { secureCookieConfig } from '../config/secureCookieConfig.js';
import type { IAuthTokenService } from '../../auth/types/auth.core.tokens.contracts.js';
import type { TCoreRepositories } from './createCoreRepositories.js';
//import { PermissionService } from '../../permissions/core/PermissionService.js';

/**
 * Type representing the core services of the application.
 */
export type TCoreServices = {
  authTokenService: IAuthTokenService;
  calendarService: CalendarService;
};

/**
 * Factory type for creating core services.
 * @param input - An object containing the required repositories.
 * @returns An object containing the initialized core services.
 */
export type TCoreServicesFactory = (input: { repositories: TCoreRepositories }) => TCoreServices;

/**
 * Factory function to create core services.
 * @param input
 * @returns An object containing the initialized core services.
 */
export const createCoreServices: TCoreServicesFactory = input => {

  const { refreshTokenRepository } = input.repositories;

  try {
    const authTokenService = createAuthTokenService({
      findRefreshTokenFn: refreshTokenRepository.findRefreshToken,
      saveRefreshTokenFn: refreshTokenRepository.saveRefreshToken,
      deleteRefreshTokenFn: refreshTokenRepository.deleteRefreshToken,
      deleteAllRefreshTokensForUserFn: refreshTokenRepository.deleteAllRefreshTokensForUser,
      authConfig: getAuthConfig(),
      secureCookieConfig,
    });

    /*
    const permissionService = new PermissionService({
      findContractPermissionsFn: repositories.contractRepository.getContractPermissions,
    });

     */

    const calendarService = new CalendarService({
      buildCalendarFn: buildCalendar,
      colliderRegistry: {
        eventIntersection: computeEventIntersections,
      },
    });


    return {
      authTokenService,
      calendarService
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`Failed to initialize core services: ${e.message}`);
    }
    throw new Error('Failed to initialize core services: unknown error');
  }
};
