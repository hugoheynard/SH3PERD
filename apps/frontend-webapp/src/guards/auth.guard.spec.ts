import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import {
  provideRouter,
  Router,
  UrlTree,
  type CanActivateFn,
  type GuardResult,
  type MaybeAsync,
} from '@angular/router';
import { firstValueFrom, from, isObservable, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../app/core/services/auth.service';

/**
 * Angular 21 widened `CanActivateFn`'s return type to `MaybeAsync<GuardResult>`
 * (boolean | UrlTree | Promise | Observable). The guards under test in this
 * spec all return Observable, but `firstValueFrom` is typed strictly, so we
 * normalize at the test boundary.
 */
function asObservable(value: MaybeAsync<GuardResult>): Observable<GuardResult> {
  if (isObservable(value)) return value;
  if (value instanceof Promise) return from(value);
  return of(value);
}

describe('authGuard', () => {
  let authService: jest.Mocked<AuthService>;
  let router: Router;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  function configure(platformId: 'browser' | 'server') {
    authService = {
      getValidAccessToken$: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });

    router = TestBed.inject(Router);
  }

  it('should be created', () => {
    configure('browser');
    expect(executeGuard).toBeTruthy();
  });

  it('allows navigation on the server without calling auth', () => {
    configure('server');

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(true);
    expect(authService.getValidAccessToken$).not.toHaveBeenCalled();
  });

  it('allows navigation when a valid token is available', async () => {
    configure('browser');
    authService.getValidAccessToken$.mockReturnValue(of('token-123'));

    const result = await firstValueFrom(
      asObservable(executeGuard({} as never, {} as never)),
    );

    expect(result).toBe(true);
  });

  it('redirects to /login when no token is available', async () => {
    configure('browser');
    authService.getValidAccessToken$.mockReturnValue(of(null));

    const result = (await firstValueFrom(
      asObservable(executeGuard({} as never, {} as never)),
    )) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('redirects to /login when token retrieval throws', async () => {
    configure('browser');
    authService.getValidAccessToken$.mockReturnValue(
      throwError(() => new Error('refresh failed')),
    );

    const result = (await firstValueFrom(
      asObservable(executeGuard({} as never, {} as never)),
    )) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login');
  });
});
