/**
 * Cloudflare Turnstile server-side config.
 *
 * Read once at module bootstrap. Absent `TURNSTILE_SECRET_KEY` puts the
 * service into bypass mode so local dev, tests, and CI work without a
 * real Cloudflare account.
 */
export type TTurnstileConfig = {
  enabled: boolean;
  secretKey: string | null;
  verifyUrl: string;
};

const DEFAULT_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const getTurnstileConfig = (): TTurnstileConfig => {
  const secret = process.env['TURNSTILE_SECRET_KEY'];
  const secretKey = secret && secret.trim().length > 0 ? secret : null;

  return {
    enabled: secretKey !== null,
    secretKey,
    verifyUrl: process.env['TURNSTILE_VERIFY_URL'] ?? DEFAULT_VERIFY_URL,
  };
};
