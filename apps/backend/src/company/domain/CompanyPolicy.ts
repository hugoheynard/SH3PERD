import type { TUserId } from '@sh3pherd/shared-types';
import type { CompanyEntity } from './CompanyEntity.js';
import type { PermissionResolver } from '../../permissions/PermissionResolver.js';

/**
 * Business rules enforcement for the Company domain.
 *
 * Centralizes all invariants so handlers stay thin.
 * Each method either passes silently or throws with an explicit error code.
 */
export class CompanyPolicy {

  // ── Ownership ───────────────────────────────────────────

  /** Ensures the actor is the company owner. */
  ensureIsOwner(actorId: TUserId, entity: CompanyEntity): void {
    if (!entity.isOwnedBy(actorId)) {
      throw new Error('COMPANY_NOT_OWNED');
    }
  }

  // ── Status ──────────────────────────────────────────────

  /** Ensures the company is active. */
  ensureIsActive(entity: CompanyEntity): void {
    if (entity.status !== 'active') {
      throw new Error('COMPANY_NOT_ACTIVE');
    }
  }

  // ── Settings permission ─────────────────────────────────

  /**
   * Ensures the actor can manage company settings.
   * Wraps the PermissionResolver call to avoid boilerplate in every handler.
   */
  async ensureCanManageSettings(
    actorId: TUserId,
    companyId: string,
    permissionResolver: PermissionResolver,
  ): Promise<void> {
    const canWrite = await permissionResolver.hasCompanyPermission(actorId, companyId as any, 'company:settings:write');
    if (!canWrite) {
      throw new Error('COMPANY_FORBIDDEN');
    }
  }
}
