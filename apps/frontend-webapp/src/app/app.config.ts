import {
  type ApplicationConfig,
  inject,
  provideEnvironmentInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './routing/app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {PlaylistDisplayService} from './pages/playlists/playlist-display.service';
import {authInterceptor} from '../interceptors/auth.interceptor';
import {AuthService} from './services/auth.service';
import {catchError, firstValueFrom, of} from 'rxjs';

export const provideAuthEnvironmentInitializer = () =>
  provideEnvironmentInitializer(() => {
    const authService = inject(AuthService);
    return firstValueFrom(
      authService.autoLogin().pipe(
        catchError((err) => {
          console.warn('[Auth Init] Failed during autoLogin', err);
          return of(void 0);
        })
      )
    );
  });

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    provideAuthEnvironmentInitializer(),
    provideAnimationsAsync(),
    { provide: PlaylistDisplayService, useClass: PlaylistDisplayService }
  ]
};
