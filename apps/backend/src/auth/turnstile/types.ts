/**
 * Cloudflare Turnstile siteverify response.
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export type TTurnstileVerifyResponse = {
  success: boolean;
  /** When the challenge was solved (ISO 8601). */
  challenge_ts?: string;
  /** Hostname the challenge was served from. */
  hostname?: string;
  /** List of error codes when `success` is false. */
  'error-codes'?: string[];
  /** The action name passed at widget creation. */
  action?: string;
  /** Customer-defined data passed at widget creation. */
  cdata?: string;
};

export type TTurnstileVerifyArgs = {
  /** The token returned by the client-side Turnstile widget. */
  token?: string;
  /** Optional — IP address of the end-user, passed through to Cloudflare. */
  remoteIp?: string;
};

export type ITurnstileService = {
  /**
   * Verify a Turnstile token against Cloudflare.
   *
   * - When the service is disabled (no secret configured), the call is a no-op.
   *   This keeps local dev and CI green without a Turnstile account.
   * - When enabled, a missing token throws `CAPTCHA_REQUIRED`.
   * - When enabled, an invalid/expired token throws `CAPTCHA_FAILED`.
   */
  verify(args: TTurnstileVerifyArgs): Promise<void>;

  /** True when a secret key is configured. Useful for test assertions. */
  readonly enabled: boolean;
};
