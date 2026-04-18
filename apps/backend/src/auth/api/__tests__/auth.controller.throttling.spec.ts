import { AuthController } from '../auth.controller.js';

/**
 * Throttling contract for the auth surface.
 *
 * The ThrottlerModule is wired in `app.module` and a global
 * `ThrottlerGuard` is registered — but the effective limit on each
 * endpoint comes from the per-method `@Throttle()` decorator. E2E
 * tests bypass the ThrottlerGuard (see `src/E2E/utils/bootstrap.ts`)
 * so a regression that silently removed a `@Throttle()` decorator
 * would NOT be caught end-to-end. This spec asserts the decorator
 * metadata is present with the intended limits so the regression
 * shows up in the diff and fails at this layer.
 *
 * These limits are part of the auth-system documentation
 * (`apps/backend/documentation/sh3-auth-system.md` — "Rate limiting")
 * and must stay in sync with it.
 */

/*
 * @nestjs/throttler writes metadata with keys of the form
 * `THROTTLER:LIMIT${name}` / `THROTTLER:TTL${name}` / `THROTTLER:SKIP${name}`
 * where `name` is the throttler key (we use the single `default`
 * throttler in this app). Keeping the keys literal rather than
 * importing from the package so a future internal rename surfaces
 * here as a visible test failure and forces an intentional update.
 */
const THROTTLER_LIMIT_DEFAULT = 'THROTTLER:LIMITdefault';
const THROTTLER_TTL_DEFAULT = 'THROTTLER:TTLdefault';
const THROTTLER_SKIP_DEFAULT = 'THROTTLER:SKIPdefault';

function getHandler(method: string): (...args: unknown[]) => unknown {
  const target = AuthController.prototype as unknown as Record<
    string,
    (...args: unknown[]) => unknown
  >;
  const handler = target[method];
  if (!handler) {
    throw new Error(
      `AuthController has no method "${method}" — the endpoint was renamed or removed.`,
    );
  }
  return handler;
}

function readLimitAndTtl(method: string): { limit: unknown; ttl: unknown } {
  const handler = getHandler(method);
  return {
    limit: Reflect.getMetadata(THROTTLER_LIMIT_DEFAULT, handler),
    ttl: Reflect.getMetadata(THROTTLER_TTL_DEFAULT, handler),
  };
}

function readSkip(method: string): unknown {
  return Reflect.getMetadata(THROTTLER_SKIP_DEFAULT, getHandler(method));
}

describe('AuthController — throttling metadata', () => {
  describe.each([
    [
      'register',
      10,
      60_000,
      'brute-force account creation — primary defences are Turnstile (single-use tokens) + email verification; this throttle is a DDoS floor only',
    ],
    [
      'login',
      20,
      60_000,
      'credential stuffing — primary defences are Turnstile (single-use tokens) + 5/15min account lockout; this throttle is a DDoS floor only, not the fine-grained gate',
    ],
    [
      'refreshSession',
      10,
      60_000,
      'legitimate clients refresh occasionally; above 10/min is abuse',
    ],
    ['changePassword', 3, 60_000, 'rate-limits password-guessing of the current password'],
    ['deactivateAccount', 3, 60_000, 'rate-limits password-guessing of the current password'],
    ['forgotPassword', 3, 60_000, 'prevents flooding a mailbox / email-enumeration timing'],
    ['resetPassword', 3, 60_000, 'rate-limits reset-token guessing'],
  ])('%s', (method, expectedLimit, expectedTtl, _rationale) => {
    it(`should declare @Throttle({ default: { limit: ${expectedLimit}, ttl: ${expectedTtl} } })`, () => {
      const { limit, ttl } = readLimitAndTtl(method);
      expect(limit).toBe(expectedLimit);
      expect(ttl).toBe(expectedTtl);
    });

    it('should not be marked @SkipThrottle()', () => {
      expect(readSkip(method)).toBeFalsy();
    });
  });

  describe('logout', () => {
    /*
     * Logout intentionally carries no `@Throttle()` decorator and
     * falls back to the global default. A user trying to log out
     * should not be rate-limited (the action is a mitigation, not
     * an attack surface). Document the intent: neither a custom
     * limit NOR a skip marker means "use the global default".
     */
    it('should rely on the global default (no per-method limit, no skip)', () => {
      const { limit, ttl } = readLimitAndTtl('logout');
      expect(limit).toBeUndefined();
      expect(ttl).toBeUndefined();
      expect(readSkip('logout')).toBeFalsy();
    });
  });

  describe('ping', () => {
    /*
     * The /ping endpoint is the health-check surface — must NEVER
     * rate-limit. `@SkipThrottle()` is the contract.
     */
    it('should be marked @SkipThrottle() so health checks never 429', () => {
      expect(readSkip('ping')).toBe(true);
    });
  });
});
