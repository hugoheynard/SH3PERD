import { CalendarService } from '../../calendar/core/services/CalendarService.js';
import { buildCalendar } from '../../calendar/core/builders/buildCalendar.js';
import { computeEventIntersections } from '../../calendar/core/colliders/computeEventIntersection.js';
import type { IAuthTokenService } from '../../auth/core/auth.service.js';

/**
 * Type representing the core services of the application.
 */
export type TCoreServices = {
  authTokenService?: IAuthTokenService;
  calendarService: CalendarService;
};

/**
 * Factory function to create core services.
 * @param deps
 * @returns An object containing the initialized core services.
 */
export function createCoreServices(): TCoreServices {
  try {
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
      calendarService,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`Failed to initialize core services: ${e.message}`);
    }
    throw new Error('Failed to initialize core services: unknown error');
  }
}
