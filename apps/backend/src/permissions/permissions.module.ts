import { Module } from '@nestjs/common';
import { PermissionResolver } from './PermissionResolver.js';

/**
 * Provides the PermissionResolver service for checking user permissions
 * across contract roles and team hierarchy.
 *
 * Requires the consuming module to have access to CONTRACT_REPO and CAST_REPO
 * (provided by CoreRepositoriesModule).
 */
@Module({
  providers: [PermissionResolver],
  exports: [PermissionResolver],
})
export class PermissionsModule {}
