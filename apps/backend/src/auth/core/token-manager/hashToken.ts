import { createHash } from 'crypto';
import type { TRefreshToken } from '@sh3pherd/shared-types';

/**
 * Hash a refresh token with SHA-256 before storage.
 *
 * Why: refresh tokens stored in plain text are a critical vulnerability —
 * a database breach immediately exposes all active sessions. Hashing ensures
 * the token in the DB is useless without the original value (sent via HttpOnly cookie).
 *
 * SHA-256 is sufficient here because refresh tokens are high-entropy random strings
 * (UUID-based), not user-chosen passwords. No salt needed.
 *
 * Returns TRefreshToken branded type so it can be used directly in
 * MongoDB filters and record fields without extra casting.
 */
export function hashToken(token: string): TRefreshToken {
  return createHash('sha256').update(token).digest('hex') as TRefreshToken;
}
