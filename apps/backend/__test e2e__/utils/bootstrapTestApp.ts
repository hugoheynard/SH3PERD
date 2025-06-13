import { AppModule } from '../../src/appBootstrap/app.module.js';
import { loadEnv } from '../../src/appBootstrap/config/loadEnv.js';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

/**
 * Bootstraps a test NestJS application instance for end-to-end testing.
 */
export async function bootstrapTestApp(): Promise<INestApplication> {
  loadEnv(process.env.NODE_ENV || 'test');

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
};