import { afterEach, beforeEach } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { bootstrapTestApp } from '../../../../__tests__/utils/bootstrapTestApp.js';
import request from 'supertest';
import { getTestDb } from '../../../../__tests__/utils/getTestDb.js';
import { UserBuilder } from '../../../../__tests__/E2E/RessourcesBuilders/UserBuilder.js';
import { resetDbMongo } from '../../../../__tests__/utils/resetDbMongo.js';
import type { Db } from 'mongodb';

describe('E2E - Auth', () => {
  let app: INestApplication;
  let testDb: Db;

  beforeEach(async () => {
    app = await bootstrapTestApp();
    testDb = await getTestDb();
  });

  afterEach(async () => {
    try {
      await resetDbMongo(testDb);
    } catch (error) {
      console.error('Cleanup failed', error);
    }
  });

  //REGISTRATION
  it('should register a new user', async () => {
    const newUser = await UserBuilder.init(app)
      .withCredentials({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
        first_name: 'John',
        last_name: 'Doe',
      })
      .register(201);

    expect(newUser.getUserId()).toEqual(expect.any(String));
  });

  it('should reject the user if same email is used twice', async () => {
    // 1. First registration (success expected)
    await UserBuilder.init(app)
      .withCredentials({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
        first_name: 'John',
        last_name: 'Doe',
      })
      .register();

    // 2. Second registration with same email (failure expected)
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
        first_name: 'John',
        last_name: 'Doe',
      })
      .expect(409); // HTTP Conflict

    // 3. Verify error message
    expect(response.body).toMatchObject({
      message: expect.stringContaining('email'),
    });
  });

  //LOGIN
  it('should login an existing user, add token in res.body', async () => {
    await UserBuilder.init(app)
      .withCredentials({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
        first_name: 'John',
        last_name: 'Doe',
      })
      .register();

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
      })
      .expect(200);

    expect(loginResponse.body.authToken).toMatch(/^ey[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(loginResponse.body.user_id).toEqual(expect.any(String));

    expect(loginResponse.headers['set-cookie']).toContainEqual(
      expect.stringMatching(/sh3pherd_refreshToken=/),
    );
  });

  it('should logout an existing user and revoke his refreshToken', async () => {
    console.log('Step 1: register');
    const user = await UserBuilder.init(app)
      .withCredentials({
        email: 'logout@test.com',
        password: 'secure1234',
        first_name: 'Jane',
        last_name: 'Doe',
      })
      .registerAndLogin();

    expect(user.getRefreshCookie()).toMatch(/sh3pherd_refreshToken=/);
    console.log('Step 2: before logout');
    const res = await user.logout();
    expect(res.body).toEqual({ message: 'Logout successful' });
  });

  it('should mark the user as inactive [SOFT DELETE] as a suppression', async () => {});
});
