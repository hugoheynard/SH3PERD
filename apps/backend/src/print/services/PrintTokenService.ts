import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';

/**
 * Scopes embedded in print JWTs. One scope per exportable resource so that
 * a token minted for the orgchart can never be reused to render, e.g., a
 * contract export page.
 */
export type TPrintScope = 'orgchart';

export type TPrintTokenPayload = {
  scope: TPrintScope;
  companyId: TCompanyId;
  actorId: TUserId;
  /** JWT id — the unique identifier of this token, used for the single-use store. */
  jti: string;
};

/**
 * Signs and verifies short-lived, single-use JWTs that allow a headless
 * Chromium instance to fetch the print-only frontend route and the
 * backend read endpoint without carrying a full user session.
 *
 * ## Lifecycle
 *
 * 1. `sign(scope, companyId, actorId)` — issues a token with a fresh `jti`,
 *    a 2-minute TTL and HS256 signing. Returns the token string.
 * 2. `verify(token, scope)` — validates the JWT signature, the expiration,
 *    the scope, and the single-use store. If the token has already been
 *    consumed, verification fails.
 * 3. Verified tokens are automatically consumed (blacklisted) on first use.
 *
 * The single-use store is an in-memory `Map<jti, expiresAt>` with periodic
 * cleanup. This is intentional: print tokens are short-lived, only the
 * instance that issued the token is expected to consume it (sticky Puppeteer
 * session), and we want zero external dependencies for a backend service
 * that already shoulders a lot. If you run multi-instance Puppeteer workers,
 * swap this for a Redis-backed store in `consumedStore`.
 */
@Injectable()
export class PrintTokenService {
  private readonly secret: string;
  /** TTL in seconds — tight window: enough to let the page boot and print. */
  private static readonly TTL_SECONDS = 120;

  /**
   * Single-use store: once a token is verified it is added here so a replay
   * of the same `jti` is rejected. Entries expire automatically.
   */
  private readonly consumed = new Map<string, number>();

  /** Cleanup interval handle — cleared on module destroy. */
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<{ secret: string }>('print')?.secret;
    if (!secret) {
      throw new Error('[PrintTokenService] Missing print.secret in config');
    }
    this.secret = secret;

    // Prune expired entries every minute — cheap and keeps memory bounded
    // even if a replay storm fills the map with spurious jtis.
    this.cleanupTimer = setInterval(() => this.pruneExpired(), 60_000);
    this.cleanupTimer.unref?.();
  }

  /** Issues a fresh print token for the given resource + actor. */
  sign(scope: TPrintScope, companyId: TCompanyId, actorId: TUserId): string {
    const payload: Omit<TPrintTokenPayload, 'jti'> & { jti: string } = {
      scope,
      companyId,
      actorId,
      jti: randomUUID(),
    };
    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: PrintTokenService.TTL_SECONDS,
    });
  }

  /**
   * Verifies a print token and marks it as consumed. Throws
   * `UnauthorizedException` on any failure (invalid signature, expired,
   * wrong scope, replay). The exception message is intentionally generic
   * to avoid leaking which check failed.
   */
  verify(token: string, expectedScope: TPrintScope): TPrintTokenPayload {
    let payload: TPrintTokenPayload;
    try {
      payload = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as TPrintTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid print token');
    }

    if (payload.scope !== expectedScope) {
      throw new UnauthorizedException('Invalid print token');
    }

    if (!payload.jti || typeof payload.jti !== 'string') {
      throw new UnauthorizedException('Invalid print token');
    }

    if (this.consumed.has(payload.jti)) {
      throw new UnauthorizedException('Invalid print token');
    }

    // Mark consumed — expiration is derived from the JWT `exp` claim to
    // auto-free the entry once the token couldn't be used anyway.
    const expUnix = (payload as unknown as { exp?: number }).exp;
    const expiresAt = expUnix ? expUnix * 1000 : Date.now() + PrintTokenService.TTL_SECONDS * 1000;
    this.consumed.set(payload.jti, expiresAt);

    return payload;
  }

  /**
   * Test-only helper to verify a token without consuming it. Do not use in
   * production paths — single-use is a security invariant here.
   */
  peek(token: string, expectedScope: TPrintScope): TPrintTokenPayload | null {
    try {
      const payload = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as TPrintTokenPayload;
      if (payload.scope !== expectedScope) return null;
      return payload;
    } catch {
      return null;
    }
  }

  /** Removes entries whose TTL has passed. O(n) where n is the store size. */
  private pruneExpired(): void {
    const now = Date.now();
    for (const [jti, expiresAt] of this.consumed) {
      if (expiresAt <= now) this.consumed.delete(jti);
    }
  }

  /** Called by Nest when the module is torn down (tests, graceful shutdown). */
  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer);
    this.consumed.clear();
  }
}
