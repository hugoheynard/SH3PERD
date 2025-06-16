import { afterEach, beforeEach } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { bootstrapTestApp } from '../../utils/bootstrapTestApp';
import request from 'supertest';
import { getTestDb } from '../../utils/getTestDb';
import { UserBuilder } from '../RessourcesBuilders/UserBuilder';
import { resetDbMongo } from '../../utils/resetDbMongo';

describe ('E2E - Auth', () => {
  let app: INestApplication;
  let testDb;

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
      })
      .register();

    // 2. Second registration with same email (failure expected)
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
      })
      .expect(409); // HTTP Conflict

    // 3. Vérifie le message d’erreur
    expect(response.body).toMatchObject({
      message: expect.stringContaining('email'),
    });
  });

  //LOGIN
  it('should login an existing user, add token in res.body', async () => {
    const newUser = await UserBuilder.init(app)
      .withCredentials({
        email: 'user1Pass@example.com',
        password: 'securePassword123',
      })
      .registerAndLogin();

    // userId should be defined and a string
    expect(newUser.getUserId()).toEqual(expect.any(String));

    // token should be present and in valid JWT format
    expect(newUser.getToken()).toMatch(/^ey[\w-]+\.[\w-]+\.[\w-]+$/);

    expect(res.headers['set-cookie']).toContainEqual(expect.stringMatching(/sh3pherd_refreshToken=/));

  });




  it ('should mark the user as inactive [SOFT DELETE] as a suppression', async () => {});
});