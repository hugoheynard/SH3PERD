import { Logger } from '@nestjs/common';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';
import type { TTurnstileConfig } from './getTurnstileConfig.js';
import type { ITurnstileService, TTurnstileVerifyArgs, TTurnstileVerifyResponse } from './types.js';

/**
 * Server-side verification of Cloudflare Turnstile tokens.
 *
 * The widget on the client issues a short-lived token. Before trusting any
 * human-originated action (login, register), the server exchanges that
 * token with Cloudflare's siteverify endpoint using the secret key. Tokens
 * are single-use and bound to the IP that solved the challenge (when
 * `remoteip` is passed).
 *
 * Progressive behaviour is delegated to Cloudflare's "managed" mode —
 * invisible for non-suspicious traffic, interactive for bots.
 */
export class TurnstileService implements ITurnstileService {
  private readonly logger = new Logger('Turnstile');

  constructor(private readonly config: TTurnstileConfig) {
    if (!config.enabled) {
      this.logger.warn(
        'TURNSTILE_SECRET_KEY is not configured — captcha verification is bypassed. ' +
          'Set the env var in production.',
      );
    }
  }

  get enabled(): boolean {
    return this.config.enabled;
  }

  async verify({ token, remoteIp }: TTurnstileVerifyArgs): Promise<void> {
    if (!this.config.enabled || this.config.secretKey === null) {
      return;
    }

    if (!token || token.trim().length === 0) {
      this.logger.warn('Captcha token missing on protected endpoint');
      throw new BusinessError('Captcha verification is required.', {
        code: 'CAPTCHA_REQUIRED',
        status: 400,
      });
    }

    const body = new URLSearchParams();
    body.set('secret', this.config.secretKey);
    body.set('response', token);
    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    let payload: TTurnstileVerifyResponse;
    try {
      const res = await fetch(this.config.verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      payload = (await res.json()) as TTurnstileVerifyResponse;
    } catch (err) {
      // Fail-open on network / parse failure: Cloudflare outages shouldn't
      // take our auth down. Throttling (5/min/IP) and account lockout
      // (5 failures → 15min) remain active and bound the attack surface.
      // The warn is loud on purpose — this is the signal that the auth
      // surface is temporarily less protected.
      this.logger.warn(
        `Turnstile siteverify unreachable — allowing request (fail-open). ` +
          `reason=${err instanceof Error ? err.message : String(err)}`,
      );
      return;
    }

    if (!payload.success) {
      const codes = payload['error-codes']?.join(',') ?? 'unknown';
      this.logger.warn(`Captcha rejected — codes=${codes}`);
      throw new BusinessError('Captcha verification failed.', {
        code: 'CAPTCHA_FAILED',
        status: 400,
      });
    }
  }
}
