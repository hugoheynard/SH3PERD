import { createAuthTokenService } from '../../auth/factories/createAuthTokenService.js';
import { CalendarService } from '../../calendar/core/services/CalendarService.js';
import { buildCalendar } from '../../calendar/core/builders/buildCalendar.js';
import { computeEventIntersections } from '../../calendar/core/colliders/computeEventIntersection.js';
import { getAuthConfig } from '../config/getAuthConfig.js';
import { secureCookieConfig } from '../config/secureCookieConfig.js';
import type { IAuthTokenService } from '../../auth/core/services/AuthTokenService.js';
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
 * Factory function to create core services.
 * @param deps
 * @returns An object containing the initialized core services.
 */
export function createCoreServices(deps: { repositories: TCoreRepositories }): TCoreServices{

  const refreshTokenRepo = deps.repositories.refreshToken;

  try {
    const authTokenService = createAuthTokenService({
      findOneRefreshTokenFn: filter => refreshTokenRepo.findOne(filter),
      saveFn: refreshTokenRecord => refreshTokenRepo.save(refreshTokenRecord),
      deleteRefreshTokenFn: filter => refreshTokenRepo.deleteOne(filter),
      deleteAllRefreshTokensForUserFn: filter => refreshTokenRepo.deleteMany(filter),
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
