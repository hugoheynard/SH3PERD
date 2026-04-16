/**
 * E2E test utilities — barrel export.
 *
 * Usage in test files:
 *   import { bootstrapE2E, teardownE2E, resetAllCollections, UserBuilder, WorkspaceSetup } from '../utils';
 */

export { bootstrapE2E, teardownE2E } from './bootstrap.js';
export type { E2EContext } from './bootstrap.js';
export { getBody, getSetCookies, getTestServer } from './http.js';

export {
  resetAllCollections,
  resetCollections,
  resetMusicCollections,
  resetCompanyCollections,
  resetAuthCollections,
} from './db-cleanup.js';

export { UserBuilder } from './user.builder.js';
export type { UserCredentials, UserProfile } from './user.builder.js';

export { WorkspaceSetup } from './workspace.setup.js';
export type { WorkspaceContext } from './workspace.setup.js';

export { seedUser, seedCompany, seedWorkspace } from './factories.js';
export type { SeededUser, SeededWorkspace } from './factories.js';
