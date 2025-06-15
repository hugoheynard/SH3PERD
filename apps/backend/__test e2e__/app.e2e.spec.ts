import { type INestApplication } from '@nestjs/common';
import { bootstrapTestApp } from './utils/bootstrapTestApp.js';
import { routesToTest, runE2EDynamicRoutesTest } from './e2e_tests/runE2EDynamicRoutes.test.js';



describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await bootstrapTestApp();

  });
});

runE2EDynamicRoutesTest(routesToTest);
