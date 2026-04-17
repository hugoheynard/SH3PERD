import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthTokenService } from '../auth-token.service';
import { UserContextService } from '../user-context.service';
import { ScopedHttpClient } from '../../utils/ScopedHttpClient';
import { ToastService } from '../../../shared/toast/toast.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: jest.Mocked<AuthTokenService>;
  let userContext: jest.Mocked<UserContextService>;
  let router: jest.Mocked<Router>;

  const authUrl = 'http://localhost:3000/api/auth';

  beforeEach(() => {
    tokenService = {
      setToken: jest.fn(),
      getToken: jest.fn(),
      willExpireWithin: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<AuthTokenService>;
    userContext = {
      getUser: jest.fn(),
    } as unknown as jest.Mocked<UserContextService>;
    router = { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
    router.navigate.mockReturnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: AuthTokenService, useValue: tokenService },
        { provide: UserContextService, useValue: userContext },
        { provide: Router, useValue: router },
        { provide: ScopedHttpClient, useValue: {} },
        { provide: ToastService, useValue: { show: jest.fn() } },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('logs in successfully, stores the token and loads the user context', fakeAsync(() => {
    let result: boolean | undefined;

    service
      .login$({ email: 'john@doe.com', password: 'secret' })
      .subscribe((value) => {
        result = value;
      });

    const req = httpMock.expectOne(`${authUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      email: 'john@doe.com',
      password: 'secret',
    });

    req.flush({ authToken: 'token-123' });
    tick(200);

    expect(result).toBe(true);
    expect(tokenService.setToken).toHaveBeenCalledWith('token-123');
    expect(userContext.getUser).toHaveBeenCalled();
    expect(tokenService.clear).not.toHaveBeenCalled();
  }));

  it('returns false and clears auth state when the login response has no token', fakeAsync(() => {
    let result: boolean | undefined;

    service
      .login$({ email: 'john@doe.com', password: 'secret' })
      .subscribe((value) => {
        result = value;
      });

    httpMock.expectOne(`${authUrl}/login`).flush({});
    tick(200);

    expect(result).toBe(false);
    expect(tokenService.clear).toHaveBeenCalled();
    expect(userContext.getUser).not.toHaveBeenCalled();
  }));

  it('returns false and clears auth state when login fails', () => {
    let result: boolean | undefined;

    service
      .login$({ email: 'john@doe.com', password: 'secret' })
      .subscribe((value) => {
        result = value;
      });

    httpMock.expectOne(`${authUrl}/login`).flush('boom', {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(result).toBe(false);
    expect(tokenService.clear).toHaveBeenCalled();
  });

  it('reuses the same refresh request while one is already in flight', () => {
    const resultsA: Array<string | null> = [];
    const resultsB: Array<string | null> = [];
    tokenService.getToken.mockReturnValue('fresh-token');

    const refreshA$ = service.refreshSession$();
    const refreshB$ = service.refreshSession$();

    expect(refreshA$).toBe(refreshB$);

    refreshA$.subscribe((value) => resultsA.push(value));
    refreshB$.subscribe((value) => resultsB.push(value));

    const req = httpMock.expectOne(`${authUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush({ authToken: 'fresh-token' });

    expect(resultsA).toEqual(['fresh-token']);
    expect(resultsB).toEqual(['fresh-token']);
    expect(tokenService.setToken).toHaveBeenCalledWith('fresh-token');
    expect(userContext.getUser).toHaveBeenCalled();
  });

  it('clears auth state when refresh returns no token', async () => {
    tokenService.getToken.mockReturnValue(null);

    const refreshPromise = firstValueFrom(service.refreshSession$());

    httpMock.expectOne(`${authUrl}/refresh`).flush({});

    await expect(refreshPromise).resolves.toBeNull();
    expect(tokenService.clear).toHaveBeenCalled();
    expect(tokenService.setToken).toHaveBeenCalledWith(null);
    expect(userContext.getUser).not.toHaveBeenCalled();
  });

  it('clears auth state when refresh fails', async () => {
    const refreshPromise = firstValueFrom(service.refreshSession$());

    httpMock.expectOne(`${authUrl}/refresh`).flush('boom', {
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(refreshPromise).resolves.toBeNull();
    expect(tokenService.clear).toHaveBeenCalled();
  });

  it('clears local auth state immediately on logout and navigates after the API call', fakeAsync(() => {
    service.logout();

    expect(tokenService.clear).toHaveBeenCalled();

    const req = httpMock.expectOne(`${authUrl}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush({});
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('still navigates to login when logout returns 404', fakeAsync(() => {
    service.logout();

    httpMock.expectOne(`${authUrl}/logout`).flush('missing', {
      status: 404,
      statusText: 'Not Found',
    });
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('returns the current token when it is still valid', async () => {
    tokenService.getToken.mockReturnValue('cached-token');
    tokenService.willExpireWithin.mockReturnValue(false);

    await expect(firstValueFrom(service.getValidAccessToken$())).resolves.toBe(
      'cached-token',
    );

    expect(tokenService.getToken).toHaveBeenCalled();
    expect(tokenService.willExpireWithin).toHaveBeenCalledWith(15);
    httpMock.expectNone(`${authUrl}/refresh`);
  });

  it('refreshes the session when the token is missing or expiring soon', async () => {
    tokenService.getToken.mockReturnValue(null);

    const tokenPromise = firstValueFrom(service.getValidAccessToken$());

    httpMock
      .expectOne(`${authUrl}/refresh`)
      .flush({ authToken: 'fresh-token' });

    await expect(tokenPromise).resolves.toBe('fresh-token');
  });

  it('registers successfully', async () => {
    const resultPromise = firstValueFrom(
      service.register$({
        email: 'john@doe.com',
        password: 'secret',
        first_name: 'John',
        last_name: 'Doe',
        account_type: 'artist',
      }),
    );

    const req = httpMock.expectOne(`${authUrl}/register`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    await expect(resultPromise).resolves.toBe(true);
  });

  it('returns false when registration fails', async () => {
    const resultPromise = firstValueFrom(
      service.register$({
        email: 'john@doe.com',
        password: 'secret',
        first_name: 'John',
        last_name: 'Doe',
        account_type: 'artist',
      }),
    );

    httpMock.expectOne(`${authUrl}/register`).flush('nope', {
      status: 409,
      statusText: 'Conflict',
    });

    await expect(resultPromise).resolves.toBe(false);
  });

  it('sends forgot-password requests and normalizes failures to false', async () => {
    const successPromise = firstValueFrom(
      service.forgotPassword$('john@doe.com'),
    );
    httpMock.expectOne(`${authUrl}/forgot-password`).flush({});
    await expect(successPromise).resolves.toBe(true);

    const failurePromise = firstValueFrom(
      service.forgotPassword$('john@doe.com'),
    );
    httpMock.expectOne(`${authUrl}/forgot-password`).flush('nope', {
      status: 500,
      statusText: 'Server Error',
    });
    await expect(failurePromise).resolves.toBe(false);
  });

  it('sends reset-password requests and normalizes failures to false', async () => {
    const successPromise = firstValueFrom(
      service.resetPassword$('reset-token', 'new-secret'),
    );
    httpMock.expectOne(`${authUrl}/reset-password`).flush({});
    await expect(successPromise).resolves.toBe(true);

    const failurePromise = firstValueFrom(
      service.resetPassword$('reset-token', 'new-secret'),
    );
    httpMock.expectOne(`${authUrl}/reset-password`).flush('nope', {
      status: 400,
      statusText: 'Bad Request',
    });
    await expect(failurePromise).resolves.toBe(false);
  });

  it('sends change-password requests with credentials', async () => {
    const resultPromise = firstValueFrom(
      service.changePassword$('old-secret', 'new-secret'),
    );

    const req = httpMock.expectOne(`${authUrl}/change-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});

    await expect(resultPromise).resolves.toBe(true);
  });

  it('propagates deactivate-account errors to the caller', async () => {
    const resultPromise = firstValueFrom(service.deactivateAccount$('secret'));

    httpMock
      .expectOne(`${authUrl}/deactivate-account`)
      .flush('wrong password', {
        status: 400,
        statusText: 'Bad Request',
      });

    await expect(resultPromise).rejects.toBeTruthy();
  });

  it('pings the authenticated session with credentials', async () => {
    const resultPromise = firstValueFrom(service.ping$());

    const req = httpMock.expectOne(`${authUrl}/ping`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null);

    await expect(resultPromise).resolves.toBeNull();
  });
});
