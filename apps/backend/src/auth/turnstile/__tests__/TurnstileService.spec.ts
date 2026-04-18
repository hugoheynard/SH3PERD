import { TurnstileService } from '../TurnstileService.js';
import type { TTurnstileConfig } from '../getTurnstileConfig.js';
import type { TTurnstileVerifyResponse } from '../types.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

const VERIFY_URL = 'https://turnstile.test/verify';

function mockFetch(response: Partial<TTurnstileVerifyResponse>): jest.Mock {
  const fn = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(response),
  });

  (global as any).fetch = fn;
  return fn;
}

function mockFetchReject(err: Error): jest.Mock {
  const fn = jest.fn().mockRejectedValue(err);

  (global as any).fetch = fn;
  return fn;
}

function makeConfig(overrides: Partial<TTurnstileConfig> = {}): TTurnstileConfig {
  return {
    enabled: true,
    secretKey: 'test-secret',
    verifyUrl: VERIFY_URL,
    ...overrides,
  };
}

describe('TurnstileService', () => {
  afterEach(() => {
    delete (global as any).fetch;
    jest.restoreAllMocks();
  });

  describe('disabled (no secret configured)', () => {
    it('is a no-op — does not call fetch even with an empty token', async () => {
      const fetchMock = mockFetch({ success: true });
      const svc = new TurnstileService(makeConfig({ enabled: false, secretKey: null }));

      await expect(svc.verify({ token: undefined })).resolves.toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('exposes enabled=false', () => {
      const svc = new TurnstileService(makeConfig({ enabled: false, secretKey: null }));
      expect(svc.enabled).toBe(false);
    });
  });

  describe('enabled', () => {
    it('throws CAPTCHA_REQUIRED (400) when token is missing', async () => {
      const fetchMock = mockFetch({ success: true });
      const svc = new TurnstileService(makeConfig());

      try {
        await svc.verify({ token: undefined });
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).code).toBe('CAPTCHA_REQUIRED');
        expect((e as BusinessError).status).toBe(400);
      }
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws CAPTCHA_REQUIRED when token is whitespace only', async () => {
      const svc = new TurnstileService(makeConfig());

      try {
        await svc.verify({ token: '   ' });
        fail('Should have thrown');
      } catch (e) {
        expect((e as BusinessError).code).toBe('CAPTCHA_REQUIRED');
      }
    });

    it('throws CAPTCHA_FAILED (400) when Cloudflare returns success=false', async () => {
      mockFetch({ success: false, 'error-codes': ['invalid-input-response'] });
      const svc = new TurnstileService(makeConfig());

      try {
        await svc.verify({ token: 'some-token' });
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessError);
        expect((e as BusinessError).code).toBe('CAPTCHA_FAILED');
        expect((e as BusinessError).status).toBe(400);
      }
    });

    it('fails open when fetch itself rejects (Cloudflare outage should not block login)', async () => {
      mockFetchReject(new Error('ENETUNREACH'));
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const svc = new TurnstileService(makeConfig());

      await expect(svc.verify({ token: 'some-token' })).resolves.toBeUndefined();

      warnSpy.mockRestore();
    });

    it('resolves silently when Cloudflare confirms success', async () => {
      mockFetch({ success: true, hostname: 'app.test' });
      const svc = new TurnstileService(makeConfig());

      await expect(svc.verify({ token: 'good-token' })).resolves.toBeUndefined();
    });

    it('POSTs form-encoded body to the configured verify URL with secret+response', async () => {
      const fetchMock = mockFetch({ success: true });
      const svc = new TurnstileService(makeConfig());

      await svc.verify({ token: 'token-abc' });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(VERIFY_URL);
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>)['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );
      const params = new URLSearchParams(init.body as string);
      expect(params.get('secret')).toBe('test-secret');
      expect(params.get('response')).toBe('token-abc');
      expect(params.get('remoteip')).toBeNull();
    });

    it('includes remoteip when provided', async () => {
      const fetchMock = mockFetch({ success: true });
      const svc = new TurnstileService(makeConfig());

      await svc.verify({ token: 'token-abc', remoteIp: '203.0.113.5' });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const params = new URLSearchParams(init.body as string);
      expect(params.get('remoteip')).toBe('203.0.113.5');
    });

    it('exposes enabled=true', () => {
      const svc = new TurnstileService(makeConfig());
      expect(svc.enabled).toBe(true);
    });
  });
});
