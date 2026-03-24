import {
  type ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './routing/app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {PlaylistDisplayService} from './features/playlists/playlist-display.service';
import {authInterceptor} from '../interceptors/auth.interceptor';
import { TIMELINE_PROJECTOR } from './features/programs/services/timelineProjectionSystem/TimelineProjector';
import { TimelineProjectionService } from './features/programs/services/timelineProjectionSystem/TimelineProjectionService';






export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    { provide: PlaylistDisplayService, useClass: PlaylistDisplayService },
    {
      provide: TIMELINE_PROJECTOR,
      useExisting: TimelineProjectionService
    }

  ]
};
