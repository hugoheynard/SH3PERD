import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../app/core/services/auth.service';

describe('authInterceptor (Angular 18+)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      getValidAccessToken$: jest.fn(),
      refreshSession$: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('bypasses auth endpoints while still enabling credentials for API calls', () => {
    http.post('/api/auth/login', { email: 'john@doe.com' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(authService.getValidAccessToken$).not.toHaveBeenCalled();
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('bypasses auth when X-Skip-Auth is explicitly set', () => {
    http
      .get('/api/public/ping', { headers: { 'X-Skip-Auth': '1' } })
      .subscribe();

    const req = httpMock.expectOne('/api/public/ping');
    expect(authService.getValidAccessToken$).not.toHaveBeenCalled();
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-Skip-Auth')).toBe('1');
    req.flush({});
  });

  it('adds the bearer token when one is available', () => {
    authService.getValidAccessToken$.mockReturnValue(of('token-123'));

    http.get('/api/protected/projects').subscribe();
    const req = httpMock.expectOne('/api/protected/projects');

    expect(authService.getValidAccessToken$).toHaveBeenCalled();
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });

  it('forwards the request without Authorization when no token is available', () => {
    authService.getValidAccessToken$.mockReturnValue(of(null));

    http.get('/api/protected/projects').subscribe();
    const req = httpMock.expectOne('/api/protected/projects');

    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('refreshes the session and retries once after a 401', () => {
    authService.getValidAccessToken$.mockReturnValue(of('stale-token'));
    authService.refreshSession$.mockReturnValue(of('fresh-token'));

    let responseBody: unknown;
    http.get('/api/protected/projects').subscribe((response) => {
      responseBody = response;
    });

    const firstReq = httpMock.expectOne('/api/protected/projects');
    expect(firstReq.request.headers.get('Authorization')).toBe(
      'Bearer stale-token',
    );
    firstReq.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    const retryReq = httpMock.expectOne('/api/protected/projects');
    expect(authService.refreshSession$).toHaveBeenCalled();
    expect(retryReq.request.headers.get('Authorization')).toBe(
      'Bearer fresh-token',
    );
    expect(retryReq.request.headers.get('X-Retry')).toBe('1');
    retryReq.flush({ ok: true });

    expect(responseBody).toEqual({ ok: true });
  });

  it('propagates the original 401 when refresh does not return a new token', () => {
    authService.getValidAccessToken$.mockReturnValue(of('stale-token'));
    authService.refreshSession$.mockReturnValue(of(null));

    let error: HttpErrorResponse | undefined;
    http.get('/api/protected/projects').subscribe({
      error: (err) => {
        error = err;
      },
    });

    const firstReq = httpMock.expectOne('/api/protected/projects');
    firstReq.flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(error?.status).toBe(401);
    httpMock.expectNone('/api/protected/projects');
  });

  it('skips protected API requests on the server', () => {
    TestBed.resetTestingModule();
    authService = {
      getValidAccessToken$: jest.fn(),
      refreshSession$: jest.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    let completed = false;
    http.get('/api/protected/projects').subscribe({
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
    expect(authService.getValidAccessToken$).not.toHaveBeenCalled();
    httpMock.expectNone('/api/protected/projects');
  });
});
