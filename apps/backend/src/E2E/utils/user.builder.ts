/**
 * Fluent builder for creating + authenticating a test user.
 *
 * Encapsulates the register → login → token extraction chain and
 * provides getter methods for use in subsequent API calls.
 *
 * Usage:
 *   const user = await UserBuilder.init(app)
 *     .withCredentials({ email: 'a@test.com', password: 'TestPass123!' })
 *     .withProfile({ first_name: 'Alice', last_name: 'Test' })
 *     .registerAndLogin();
 *
 *   // In a request:
 *   request(app.getHttpServer())
 *     .get('/api/protected/music/library/me')
 *     .set('Authorization', user.getAuthHeader())
 */

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { TLoginResponseDTO, TUserId } from '@sh3pherd/shared-types';
import { getBody, getSetCookies, getTestServer } from './http.js';

type RegisterResponse = {
  id?: TUserId;
  user_id?: TUserId;
};

type RefreshResponse = {
  authToken?: string | null;
};

export type UserCredentials = {
  email: string;
  password: string;
};

export type UserProfile = {
  first_name: string;
  last_name: string;
};

export class UserBuilder {
  private readonly app: INestApplication;
  private credentials: UserCredentials | null = null;
  private profile: UserProfile = { first_name: 'Test', last_name: 'User' };
  private userId: string | null = null;
  private authToken: string | null = null;
  private refreshCookie: string | null = null;

  private constructor(app: INestApplication) {
    this.app = app;
  }

  static init(app: INestApplication): UserBuilder {
    return new UserBuilder(app);
  }

  withCredentials(creds: UserCredentials): this {
    this.credentials = creds;
    return this;
  }

  withProfile(profile: UserProfile): this {
    this.profile = profile;
    return this;
  }

  /** Register the user. Throws on non-201. */
  async register(): Promise<this> {
    if (!this.credentials) throw new Error('[UserBuilder] Missing credentials');

    const res = await request(getTestServer(this.app))
      .post('/api/auth/register')
      .send({
        ...this.credentials,
        ...this.profile,
        account_type: 'artist',
      })
      .expect(201);
    const body = getBody<RegisterResponse>(res);

    this.userId = body.id ?? body.user_id ?? null;
    return this;
  }

  /** Login the user. Extracts the auth token + refresh cookie. */
  async login(): Promise<this> {
    if (!this.credentials) throw new Error('[UserBuilder] Missing credentials');

    const res = await request(getTestServer(this.app))
      .post('/api/auth/login')
      .send({
        email: this.credentials.email,
        password: this.credentials.password,
      })
      .expect(200);
    const body = getBody<TLoginResponseDTO>(res);

    this.authToken = body.authToken;
    this.userId = body.user_id ?? this.userId;

    if (!this.authToken) {
      throw new Error('[UserBuilder] No authToken in login response');
    }

    // Extract refresh cookie
    this.refreshCookie =
      getSetCookies(res).find((cookie) => cookie.startsWith('sh3pherd_refreshToken=')) ?? null;

    return this;
  }

  /** Shortcut: register then login. */
  async registerAndLogin(): Promise<this> {
    await this.register();
    await this.login();
    return this;
  }

  /** Refresh the auth token via the refresh cookie. */
  async refresh(): Promise<this> {
    if (!this.refreshCookie) throw new Error('[UserBuilder] No refresh cookie');

    // NestJS @Post() defaults to 201, some setups return 200 — accept both
    const res = await request(getTestServer(this.app))
      .post('/api/auth/refresh')
      .set('Cookie', this.refreshCookie);
    const body = getBody<RefreshResponse>(res);

    if (body.authToken) {
      this.authToken = body.authToken;
    }

    // Update refresh cookie if a new one was set
    const newCookie = getSetCookies(res).find((cookie) =>
      cookie.startsWith('sh3pherd_refreshToken='),
    );
    if (newCookie) this.refreshCookie = newCookie;

    return this;
  }

  /** Logout. Clears the stored tokens. */
  async logout(): Promise<request.Response> {
    const res = await request(getTestServer(this.app))
      .post('/api/auth/logout')
      .set('Authorization', this.getAuthHeader())
      .set('Cookie', this.refreshCookie ?? '')
      .expect(200);

    this.authToken = null;
    this.refreshCookie = null;
    return res;
  }

  // ── Getters ──────────────────────────────────────

  getUserId(): string {
    if (!this.userId) throw new Error('[UserBuilder] Not registered');
    return this.userId;
  }

  getToken(): string {
    if (!this.authToken) throw new Error('[UserBuilder] Not logged in');
    return this.authToken;
  }

  getAuthHeader(): string {
    return `Bearer ${this.getToken()}`;
  }

  getRefreshCookie(): string {
    if (!this.refreshCookie) throw new Error('[UserBuilder] No refresh cookie');
    return this.refreshCookie;
  }

  getEmail(): string {
    if (!this.credentials) throw new Error('[UserBuilder] No credentials');
    return this.credentials.email;
  }
}
