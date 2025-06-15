import type { INestApplication } from '@nestjs/common';
import { bootstrapTestApp } from '../utils/bootstrapTestApp.js';
import request from 'supertest';

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
    method: 'GET',
    path: '/api/test',
    expectedStatus: 200,
    expectedBody: 'API ok',
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    expectedStatus: 201,
    sendBody: { email: 'test@mail.com', password: 'test123' },
    expectedBody: { access_token: expect.any(String) },
  },
];


describe('E2E - Dynamic routes', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await bootstrapTestApp();
  });

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