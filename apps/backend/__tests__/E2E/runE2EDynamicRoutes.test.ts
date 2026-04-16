import type { INestApplication } from '@nestjs/common';
import { bootstrapTestApp } from '../utils/bootstrapTestApp.js';
import request from 'supertest';
import { UserBuilder } from './RessourcesBuilders/UserBuilder.js';

type RouteTest = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  expectedStatus: number;
  expectedBody?: string | Record<string, any>;
  sendBody?: Record<string, any>;
  headers?: Record<string, string>;
};

export const routesToTest: RouteTest[] = [
  {
    method: 'GET',
    path: '/api',
    expectedStatus: 200,
    expectedBody: 'Hello World!',
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    expectedStatus: 200,
    sendBody: { email: 'test@mail.com', password: 'test123' },
    expectedBody: { authToken: expect.any(String), user_id: expect.any(String) },
  },
];

describe('E2E - Dynamic routes', () => {
  const app: INestApplication = await bootstrapTestApp();
  let testUser;

  // Creates test@mail.com si le test login est présent
  const needsLoginTest = routesToTest.some((r) => r.path.includes('/auth/login'));

  if (needsLoginTest) {
    testUser = await UserBuilder.init(app)
      .withCredentials({ email: 'test@mail.com', password: 'test123' })
      .registerAndLogin();
  }

  beforeEach(async () => {});

  routesToTest.forEach(({ method, path, expectedStatus, sendBody, expectedBody, headers }) => {
    it(`${method} ${path} → ${expectedStatus}`, async () => {
      let req = request(app.getHttpServer())[method.toLowerCase()](path);

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          req = req.set(key, value);
        }
      }

      if (sendBody) {
        req = req.send(sendBody);
      }

      const response = await req.expect(expectedStatus);

      if (expectedBody) {
        if (typeof expectedBody === 'string') {
          expect(response.text).toBe(expectedBody);
        } else {
          expect(response.body).toMatchObject(expectedBody);
        }
      }
    });
  });
});
