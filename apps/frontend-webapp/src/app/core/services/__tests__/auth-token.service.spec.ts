import { TestBed } from '@angular/core/testing';
import { AuthTokenService } from '../auth-token.service';

function createJwt(exp?: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(exp ? { exp } : { sub: 'user-1' }));
  return `${header}.${payload}.signature`;
}

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stores the token and decodes the JWT expiration by default', () => {
    const exp = Math.floor(Date.now() / 1000) + 60;
    const token = createJwt(exp);

    service.setToken(token);

    expect(service.getToken()).toBe(token);
    expect(service.willExpireWithin(30)).toBe(false);
    expect(service.willExpireWithin(120)).toBe(true);
  });

  it('prefers an explicit expiration when provided', () => {
    const expFromJwt = Math.floor(Date.now() / 1000) + 3600;
    const explicitExp = Math.floor(Date.now() / 1000) + 5;

    service.setToken(createJwt(expFromJwt), explicitExp);

    expect(service.willExpireWithin(10)).toBe(true);
  });

  it('returns false for invalid JWT payloads', () => {
    service.setToken('not-a-real-jwt');

    expect(service.getToken()).toBe('not-a-real-jwt');
    expect(service.willExpireWithin()).toBe(false);
  });

  it('clears both token and expiration metadata', () => {
    const exp = Math.floor(Date.now() / 1000) + 5;
    service.setToken(createJwt(exp));

    service.clear();

    expect(service.getToken()).toBeNull();
    expect(service.willExpireWithin(10)).toBe(false);
  });

  it('resets expiration when setToken receives null', () => {
    service.setToken(createJwt(Math.floor(Date.now() / 1000) + 5));

    service.setToken(null);

    expect(service.getToken()).toBeNull();
    expect(service.willExpireWithin(10)).toBe(false);
  });
});
