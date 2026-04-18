import { getTurnstileConfig } from '../getTurnstileConfig.js';

describe('getTurnstileConfig', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns enabled=false when TURNSTILE_SECRET_KEY is unset', () => {
    delete process.env['TURNSTILE_SECRET_KEY'];

    const cfg = getTurnstileConfig();

    expect(cfg.enabled).toBe(false);
    expect(cfg.secretKey).toBeNull();
  });

  it('returns enabled=false when TURNSTILE_SECRET_KEY is an empty string', () => {
    process.env['TURNSTILE_SECRET_KEY'] = '   ';

    const cfg = getTurnstileConfig();

    expect(cfg.enabled).toBe(false);
    expect(cfg.secretKey).toBeNull();
  });

  it('returns enabled=true with the secret when configured', () => {
    process.env['TURNSTILE_SECRET_KEY'] = 'test-secret';

    const cfg = getTurnstileConfig();

    expect(cfg.enabled).toBe(true);
    expect(cfg.secretKey).toBe('test-secret');
  });

  it('defaults to Cloudflare siteverify URL', () => {
    delete process.env['TURNSTILE_VERIFY_URL'];
    process.env['TURNSTILE_SECRET_KEY'] = 'x';

    const cfg = getTurnstileConfig();

    expect(cfg.verifyUrl).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  });

  it('honours TURNSTILE_VERIFY_URL override (for test doubles / self-hosted)', () => {
    process.env['TURNSTILE_SECRET_KEY'] = 'x';
    process.env['TURNSTILE_VERIFY_URL'] = 'https://example.test/verify';

    const cfg = getTurnstileConfig();

    expect(cfg.verifyUrl).toBe('https://example.test/verify');
  });
});
