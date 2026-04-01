import {
  type ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './routing/app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { TIMELINE_PROJECTOR } from './features/programs/services/timelineProjectionSystem/TimelineProjector';
import { TimelineProjectionService } from './features/programs/services/timelineProjectionSystem/TimelineProjectionService';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';

/**
 * Attempt to restore the session from the refresh-token cookie
 * BEFORE Angular's router activates any guard.
 * Skipped on the server (SSR has no access to HttpOnly cookies).
 */
function initAuth(): () => Promise<void> {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);

  return () => {
    if (!isPlatformBrowser(platformId)) return Promise.resolve();
    return firstValueFrom(auth.refreshSession$()).then(() => {}).catch(() => {});
  };
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      multi: true,
    },
{
      provide: TIMELINE_PROJECTOR,
      useExisting: TimelineProjectionService
    },
  ]
};
