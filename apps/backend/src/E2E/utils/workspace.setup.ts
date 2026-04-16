/**
 * WorkspaceSetup — one-liner to create the full auth + company +
 * contract + workspace preference chain needed for any E2E test
 * that hits a @ContractScoped() endpoint.
 *
 * Wraps the 4-step setup into a fluent builder so each test file
 * can bootstrap its authenticated workspace in one call:
 *
 *   const ws = await WorkspaceSetup.init(app)
 *     .withUser({ email: 'a@test.com', password: 'Test123!' })
 *     .withCompany('Studio X')
 *     .build();
 *
 *   // ws.user.getAuthHeader() → 'Bearer ...'
 *   // ws.companyId → 'company_xxx'
 *   // ws.contractId → 'contract_xxx'
 *
 * The created contract has `roles: ['owner']` and is automatically
 * set as the user's active workspace preference, so all subsequent
 * requests with the auth token resolve the ContractScoped guard
 * without needing to send `X-Contract-Id` explicitly.
 *
 * ## Cleanup
 *
 * Call `resetAllCollections(db)` or the domain-specific cleanups
 * in `afterAll` to remove the created data.
 */

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserBuilder } from './user.builder.js';
import type { UserCredentials, UserProfile } from './user.builder.js';
import type { TCompanyId, TContractId } from '@sh3pherd/shared-types';
import { getBody, getTestServer } from './http.js';

type CompanyCreateResponse = {
  company?: { id: TCompanyId };
  ownerContract?: { id: TContractId };
  data?: {
    company?: { id: TCompanyId };
    ownerContract?: { id: TContractId };
  };
};

export type WorkspaceContext = {
  user: UserBuilder;
  companyId: string;
  companyName: string;
  contractId: string;
  /** The auth header string ready to use in requests. */
  authHeader: string;
  /** Contract ID for explicit X-Contract-Id headers if needed. */
  contractHeader: Record<string, string>;
};

export class WorkspaceSetup {
  private readonly app: INestApplication;
  private credentials: UserCredentials = {
    email: `test-${Date.now()}@e2e.local`,
    password: 'TestPass123!',
  };
  private profile: UserProfile = { first_name: 'Test', last_name: 'User' };
  private companyName = 'Test Company';

  private constructor(app: INestApplication) {
    this.app = app;
  }

  static init(app: INestApplication): WorkspaceSetup {
    return new WorkspaceSetup(app);
  }

  /** Override the default user credentials. */
  withUser(creds: UserCredentials, profile?: UserProfile): this {
    this.credentials = creds;
    if (profile) this.profile = profile;
    return this;
  }

  /** Override the default company name. */
  withCompany(name: string): this {
    this.companyName = name;
    return this;
  }

  /**
   * Execute the full setup chain:
   * 1. Register + login the user
   * 2. Create a company (which atomically creates the owner contract)
   * 3. Set the contract as the active workspace in user preferences
   *
   * Returns a WorkspaceContext with everything needed for subsequent
   * API calls.
   */
  async build(): Promise<WorkspaceContext> {
    // 1. Register + login
    const user = await UserBuilder.init(this.app)
      .withCredentials(this.credentials)
      .withProfile(this.profile)
      .registerAndLogin();

    const authHeader = user.getAuthHeader();

    // 2. Create company → atomically creates owner contract
    const companyRes = await request(getTestServer(this.app))
      .post('/api/protected/companies')
      .set('Authorization', authHeader)
      .send({ name: this.companyName })
      .expect(201);
    const companyBody = getBody<CompanyCreateResponse>(companyRes);

    const companyId = companyBody.company?.id ?? companyBody.data?.company?.id;
    const contractId = companyBody.ownerContract?.id ?? companyBody.data?.ownerContract?.id;

    if (!companyId || !contractId) {
      throw new Error(
        `[WorkspaceSetup] Company creation response missing ids. ` +
          `Body: ${JSON.stringify(companyRes.body).slice(0, 500)}`,
      );
    }

    // 3. Set the contract as the active workspace.
    //    The preferences record might not exist yet (register doesn't
    //    create it). Hit GET /user/me first to trigger lazy creation,
    //    then PATCH the workspace.
    await request(getTestServer(this.app))
      .get('/api/protected/user/me')
      .set('Authorization', authHeader);

    const prefRes = await request(getTestServer(this.app))
      .patch('/api/protected/user/preferences')
      .set('Authorization', authHeader)
      .send({ contract_workspace: contractId });

    if (prefRes.status >= 400) {
      // If preferences PATCH still fails, try using X-Contract-Id header
      // as a fallback — the guard will resolve it from the header directly.

      console.warn(
        `[WorkspaceSetup] Preferences PATCH returned ${prefRes.status}. ` +
          `Falling back to X-Contract-Id header approach.`,
      );
    }

    return {
      user,
      companyId,
      companyName: this.companyName,
      contractId,
      authHeader,
      contractHeader: { 'X-Contract-Id': contractId },
    };
  }
}
