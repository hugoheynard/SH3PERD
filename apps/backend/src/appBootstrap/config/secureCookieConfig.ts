import type { TSecureCookieConfig } from '../../auth/types/auth.domain.tokens.js';

const isProd = process.env['NODE_ENV'] === 'production';

export const secureCookieConfig: TSecureCookieConfig = {
  // httpOnly is ALWAYS true in production, regardless of env var.
  // Only allow disabling it in dev (for debugging purposes).
  httpOnly: isProd || process.env['COOKIE_HTTP_ONLY'] !== 'false',
  secure: isProd || process.env['COOKIE_SECURE'] === 'true',
  sameSite: (process.env['COOKIE_SAME_SITE'] ?? (isProd ? 'strict' : 'lax')) as
    | 'lax'
    | 'strict'
    | 'none',
  maxAge: parseInt(process.env['COOKIE_MAX_AGE'] ?? '604800000', 10),
};
