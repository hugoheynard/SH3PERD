import type { INestApplication } from '@nestjs/common';
import type { TUserId } from '../../../src/user/types/user.domain.types.js';
import request from 'supertest';

export class UserBuilder {
  private readonly app: INestApplication;
  private userId: TUserId;
  private credentials: { email: string; password: string; first_name?: string; last_name?: string } | null;
  private authToken: string | null = null;
  private refreshCookie: string | null = null;
  private loginResponse: request.Response | null = null;

  constructor(app) {
    this.app = app;
  };

  static init(app: INestApplication): UserBuilder {
    return new UserBuilder(app);
  };

  withCredentials(credential: { email: string; password: string; first_name?: string; last_name?: string }): this {
    this.credentials = credential;
    return this;
  };
  withProfile(): this {
    return this;
  };

  //User actions
  async register(expectedStatus = 201): Promise<this> {
    if (!this.credentials) {
      throw new Error('[TEST UserBuilder] Missing credentials before register');
    }

    const res = await request(this.app.getHttpServer())
      .post('/api/auth/register')
      .send(this.credentials);

    if (res.status !== expectedStatus) {
      throw new Error(`[UserBuilder.register] Expected status ${expectedStatus}, got ${res.status}`);
    }

    this.userId = res.body.id ?? res.body.user_id;
    return this;
  }

  async login(expectedStatus = 200): Promise<this> {
    if (!this.credentials) {
      throw new Error('[TEST UserBuilder] Missing credentials before login');
    }

    const res = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send(this.credentials);

    if (res.status !== expectedStatus) {
      throw new Error(`[UserBuilder.login] Expected status ${expectedStatus}, got ${res.status}`);
    }

    this.loginResponse = res;

    const token = res.body.authToken;
    if (!token || typeof token !== 'string') {
      throw new Error('[TEST UserBuilder] No authToken found in response body');
    }

    this.authToken = token;

    //Refresh cookie handling
    const setCookie = res.headers['set-cookie'];
    this.refreshCookie = Array.isArray(setCookie)
      ? setCookie.find((c) => c.startsWith('sh3pherd_refreshToken='))
      : null;

    if (!this.refreshCookie) {
      throw new Error('[UserBuilder] refreshToken cookie not found');
    }

    this.assertRefreshCookieIsSecure(this.refreshCookie);

    return this;
  };

  async registerAndLogin(): Promise<this> {
    await this.register();
    await this.login();
    return this;
  };

  async logout(expectedStatus = 200): Promise<request.Response> {
    const logoutResponse = await request(this.app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', this.getRefreshCookie())
      .set('Authorization', this.getAuthHeader())
      .expect(expectedStatus);

    return logoutResponse;
  };

  //Checks secure cookie
  private assertRefreshCookieIsSecure(cookie: string): void {
    if (!cookie.includes('HttpOnly')) {
      throw new Error('[UserBuilder] refreshToken cookie is not HttpOnly');
    }
    if (process.env.NODE_ENV === 'production' && !cookie.includes('Secure')) {
      throw new Error('[UserBuilder] refreshToken cookie is not Secure in production');
    }
    if (!cookie.match(/SameSite=(Lax|Strict)/)) {
      throw new Error('[UserBuilder] refreshToken cookie has no valid SameSite policy');
    }
  };

  //Getters
  getUserId(): TUserId {
    if (!this.userId) {
      throw new Error('[TEST UserBuilder] - User not registered');
    }
    return this.userId;
  };

  getToken(): string {
    if (!this.authToken) {
      throw new Error('[TEST UserBuilder] - User not logged in');
    }
    return this.authToken;
  };

  getAuthHeader(): string {
    if (!this.authToken) {
      throw new Error('[UserBuilder] No authToken available, did you call login()?');
    }
    return `Bearer ${this.authToken}`;
  };

  getRefreshCookie(): string {
    if (!this.refreshCookie) {
      throw new Error('[UserBuilder] - No refreshToken cookie stored');
    }
    return this.refreshCookie;
  };

  getPayload(): { email: string; password: string; first_name?: string; last_name?: string } {
    if (!this.credentials) {
      throw new Error('[TEST UserBuilder]: No credentials set');
    }
    return this.credentials;
  };
}