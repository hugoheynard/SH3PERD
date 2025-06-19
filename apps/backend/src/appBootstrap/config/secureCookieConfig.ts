import type { TSecureCookieConfig } from '../../auth/types/auth.domain.tokens.js';

export const secureCookieConfig: TSecureCookieConfig = {
  httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
  maxAge: parseInt(process.env.COOKIE_MAX_AGE ?? '604800000', 10),
};
