import { Module } from '@nestjs/common';
import { PlatformContractContextGuard } from './api/platform-contract-context.guard.js';

/**
 * Platform contract module.
 *
 * Provides the `PlatformContractContextGuard` used by `@PlatformScoped()`
 * to resolve the user's SaaS subscription contract.
 *
 * The `PLATFORM_CONTRACT_REPO` is provided by `CoreRepositoriesModule`
 * (global), so it's available to the guard without additional imports.
 */
@Module({
  providers: [PlatformContractContextGuard],
  exports: [PlatformContractContextGuard],
})
export class PlatformContractModule {}
