import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';

const SLACK_SCOPES = [
  'channels:read',
  'channels:manage',
  'groups:write',
  'chat:write',
  'users:read',
].join(',');

interface TSlackOAuthState {
  companyId: TCompanyId;
  userId: TUserId;
}

@Injectable()
export class SlackOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly stateSecret: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.getOrThrow<string>('slackClientId');
    this.clientSecret = this.config.getOrThrow<string>('slackClientSecret');
    this.redirectUri = this.config.getOrThrow<string>('slackRedirectUri');
    this.stateSecret = this.config.getOrThrow<string>('jwtSecret');
  }

  /** Builds the Slack OAuth authorize URL with a signed state parameter. */
  buildAuthorizeUrl(companyId: TCompanyId, userId: TUserId): string {
    const state = this.signState({ companyId, userId });

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: SLACK_SCOPES,
      redirect_uri: this.redirectUri,
      state,
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  /** Exchanges a Slack authorization code for a bot token. */
  async exchangeCode(code: string): Promise<{ botToken: string; teamId: string }> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json() as {
      ok: boolean;
      access_token?: string;
      team?: { id: string };
      error?: string;
    };

    if (!data.ok || !data.access_token || !data.team) {
      throw new Error(`SLACK_OAUTH_FAILED: ${data.error ?? 'unknown'}`);
    }

    return { botToken: data.access_token, teamId: data.team.id };
  }

  /** Verifies and decodes the state JWT. */
  verifyState(state: string): TSlackOAuthState {
    try {
      const payload = jwt.verify(state, this.stateSecret, { algorithms: ['HS256'] }) as TSlackOAuthState;
      return { companyId: payload.companyId, userId: payload.userId };
    } catch {
      throw new Error('SLACK_INVALID_STATE');
    }
  }

  private signState(payload: TSlackOAuthState): string {
    return jwt.sign(payload, this.stateSecret, { algorithm: 'HS256', expiresIn: '10m' });
  }
}
