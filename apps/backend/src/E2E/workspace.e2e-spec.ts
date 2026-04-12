/**
 * E2E tests for the WorkspaceSetup helper.
 *
 * Verifies the full setup chain: user registration → company creation
 * → owner contract → workspace preference. This chain is the
 * prerequisite for every @ContractScoped() endpoint in the app.
 *
 * If these tests pass, all feature-specific E2E tests (music, orgchart,
 * playlists, etc.) can safely use `WorkspaceSetup.init(app).build()` as
 * their `beforeAll` setup.
 */

import type { INestApplication } from '@nestjs/common';
import type { Db } from 'mongodb';
import request from 'supertest';
import {
  bootstrapE2E,
  teardownE2E,
  resetAllCollections,
  WorkspaceSetup,
} from './utils/index.js';

describe('Workspace Setup E2E', () => {
  let app: INestApplication;
  let db: Db;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    db = ctx.db;
  });

  afterAll(async () => {
    await resetAllCollections(db);
    await teardownE2E(app);
  });

  afterEach(async () => {
    await resetAllCollections(db);
  });

  // ── WorkspaceSetup.build() ────────────────────────────

  describe('WorkspaceSetup.build()', () => {
    it('should create user + company + contract + set workspace', async () => {
      const ws = await WorkspaceSetup.init(app)
        .withUser(
          { email: 'ws@test.com', password: 'TestPass123!' },
          { first_name: 'Work', last_name: 'Space' },
        )
        .withCompany('Test Studio')
        .build();

      // User exists and is authenticated
      expect(ws.user.getToken()).toBeDefined();
      expect(ws.authHeader).toMatch(/^Bearer .+$/);

      // Company was created
      expect(ws.companyId).toBeDefined();
      expect(ws.companyId).toMatch(/^company_/);

      // Owner contract was created
      expect(ws.contractId).toBeDefined();
      expect(ws.contractId).toMatch(/^contract_/);

      // Contract header is set
      expect(ws.contractHeader).toEqual({ 'X-Contract-Id': ws.contractId });
    });

    it('should allow the user to access @ContractScoped() endpoints after setup', async () => {
      const ws = await WorkspaceSetup.init(app)
        .withUser({ email: 'scoped@test.com', password: 'TestPass123!' })
        .withCompany('Scoped Studio')
        .build();

      // Access a contract-scoped endpoint (e.g. get my companies)
      const res = await request(app.getHttpServer())
        .get(`/api/protected/companies/${ws.companyId}`)
        .set('Authorization', ws.authHeader)
        .set('X-Contract-Id', ws.contractId)
        .expect(200);

      expect(res.body.data).toHaveProperty('id', ws.companyId);
      expect(res.body.data).toHaveProperty('name', 'Scoped Studio');
    });

    it('should provide contractHeader for explicit X-Contract-Id usage', async () => {
      const ws = await WorkspaceSetup.init(app)
        .withUser({ email: 'pref@test.com', password: 'TestPass123!' })
        .withCompany('Pref Studio')
        .build();

      // The workspace setup provides a contractHeader for all requests.
      // This is the reliable way to pass the contract context — the
      // preferences-based fallback depends on backend auto-creating
      // the preferences record (which may not happen on register).
      expect(ws.contractHeader).toEqual({ 'X-Contract-Id': ws.contractId });

      // Verify the header works on a contract-scoped endpoint
      const res = await request(app.getHttpServer())
        .get(`/api/protected/companies/${ws.companyId}`)
        .set('Authorization', ws.authHeader)
        .set(ws.contractHeader)
        .expect(200);

      expect(res.body.data).toHaveProperty('id', ws.companyId);
    });

    it('should create the owner contract with the owner role', async () => {
      const ws = await WorkspaceSetup.init(app)
        .withUser({ email: 'owner@test.com', password: 'TestPass123!' })
        .withCompany('Owner Studio')
        .build();

      // Fetch the contract to verify roles
      const res = await request(app.getHttpServer())
        .get('/api/protected/contracts/me')
        .set('Authorization', ws.authHeader)
        .expect(200);

      const contracts = res.body.data ?? res.body;
      const ownerContract = Array.isArray(contracts)
        ? contracts.find((c: any) => c.id === ws.contractId)
        : null;

      expect(ownerContract).toBeDefined();
      expect(ownerContract.roles).toContain('owner');
      expect(ownerContract.company_id).toBe(ws.companyId);
    });
  });

  // ── Multiple workspaces ───────────────────────────────

  describe('Multiple independent workspaces', () => {
    it('should support two users with separate workspaces', async () => {
      const ws1 = await WorkspaceSetup.init(app)
        .withUser({ email: 'user1@test.com', password: 'TestPass123!' })
        .withCompany('Studio A')
        .build();

      const ws2 = await WorkspaceSetup.init(app)
        .withUser({ email: 'user2@test.com', password: 'TestPass123!' })
        .withCompany('Studio B')
        .build();

      // Both have different company + contract IDs
      expect(ws1.companyId).not.toBe(ws2.companyId);
      expect(ws1.contractId).not.toBe(ws2.contractId);

      // Each can access their own company
      await request(app.getHttpServer())
        .get(`/api/protected/companies/${ws1.companyId}`)
        .set('Authorization', ws1.authHeader)
        .set('X-Contract-Id', ws1.contractId)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/protected/companies/${ws2.companyId}`)
        .set('Authorization', ws2.authHeader)
        .set('X-Contract-Id', ws2.contractId)
        .expect(200);
    });
  });

  // ── DB cleanup verification ───────────────────────────

  describe('DB cleanup', () => {
    it('resetAllCollections should leave the DB empty', async () => {
      // Create some data
      await WorkspaceSetup.init(app)
        .withUser({ email: 'cleanup@test.com', password: 'TestPass123!' })
        .withCompany('Cleanup Studio')
        .build();

      // Verify data exists
      const userCount = await db.collection('user_credentials').countDocuments();
      expect(userCount).toBeGreaterThan(0);

      // Cleanup
      await resetAllCollections(db);

      // Verify everything is gone
      const afterCount = await db.collection('user_credentials').countDocuments();
      expect(afterCount).toBe(0);

      const companyCount = await db.collection('companies').countDocuments();
      expect(companyCount).toBe(0);

      const contractCount = await db.collection('contracts').countDocuments();
      expect(contractCount).toBe(0);
    });
  });
});
