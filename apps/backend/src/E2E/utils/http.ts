import type { INestApplication } from '@nestjs/common';
import type { Response } from 'supertest';
import type { Server as HttpServer } from 'node:http';

export function getTestServer(app: INestApplication): HttpServer {
  return app.getHttpServer() as HttpServer;
}

export function getBody<T>(response: Response): T {
  return response.body as T;
}

export function getSetCookies(response: Response): string[] {
  const setCookieHeader = response.headers['set-cookie'];
  return Array.isArray(setCookieHeader)
    ? setCookieHeader.filter((cookie): cookie is string => typeof cookie === 'string')
    : [];
}
