import { Inject, Injectable } from '@nestjs/common';
import type {
  TPermission,
  TContractRole,
  TUserId,
  TCompanyId,
  TTeamId,
  TContractRecord,
  TTeamRecord,
} from '@sh3pherd/shared-types';
import { ROLE_TEMPLATES, TEAM_ROLE_TEMPLATES } from '@sh3pherd/shared-types';
import { hasPermission } from './wildcardMatch.js';
import { resolveTeamRole } from './teamHierarchyResolver.js';
import { CAST_REPO } from '../appBootstrap/nestTokens.js';
import { CONTRACT_REPO } from '../appBootstrap/nestTokens.js';
import type { IBaseCRUD } from '../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

/**
 * Resolves the effective permissions of a user within a company.
 *
 * Resolution chain:
 * 1. Find the user's active contract for the company → extract `roles[]`
 * 2. Expand contract roles via `ROLE_TEMPLATES` → base permission set
 * 3. (Optional) For team-scoped checks: resolve team role via hierarchy,
 *    expand via `TEAM_ROLE_TEMPLATES`, scope by team type, apply overrides
 *
 * Contract-level roles like `owner` and `admin` provide company-wide access.
 * Team-level roles provide scoped access within the team's feature domain.
 */
@Injectable()
export class PermissionResolver {
  constructor(
    @Inject(CONTRACT_REPO)
    private readonly contractRepo: IBaseCRUD<TContractRecord>,
    @Inject(CAST_REPO)
    private readonly teamRepo: IBaseCRUD<TTeamRecord>,
  ) {}

  // ── Contract-level permission check ──────────────────

  /**
   * Check if a user has a required permission at the company level.
   * Uses contract roles only (owner, admin, artist, viewer).
   */
  async hasCompanyPermission(
    userId: TUserId,
    companyId: TCompanyId,
    required: string,
  ): Promise<boolean> {
    const permissions = await this.resolveCompanyPermissions(userId, companyId);
    return hasPermission(permissions, required);
  }

  /**
   * Resolve all company-level permissions from the user's contract roles.
   */
  async resolveCompanyPermissions(
    userId: TUserId,
    companyId: TCompanyId,
  ): Promise<TPermission[]> {
    const contract = await this.findActiveContract(userId, companyId);
    if (!contract) return [];

    return expandContractRoles(contract.roles);
  }

  // ── Team-scoped permission check ─────────────────────

  /**
   * Check if a user can perform an action on a target user's data
   * within a specific team context.
   *
   * Resolution:
   * 1. Contract roles (owner/admin) → company-wide bypass
   * 2. Team role (via hierarchy) → scoped to team's feature domain
   * 3. Permission overrides on the team membership
   */
  async hasTeamPermission(
    actorId: TUserId,
    companyId: TCompanyId,
    targetTeamId: TTeamId,
    required: string,
  ): Promise<boolean> {
    // 1. Contract-level check (owner/admin bypass)
    const contractPerms = await this.resolveCompanyPermissions(actorId, companyId);
    if (hasPermission(contractPerms, required)) return true;

    // 2. Team-level check (hierarchy walk)
    const allTeams = await this.teamRepo.findMany({ filter: { company_id: companyId } as any }) ?? [];
    const teamRole = resolveTeamRole(actorId, targetTeamId, allTeams);
    if (!teamRole) return false;

    // 3. Expand team role and check
    const teamPerms = expandTeamRole(teamRole);

    // 4. Apply per-member overrides if any
    const targetTeam = allTeams.find(t => t.id === targetTeamId);
    const membership = targetTeam?.members.find(
      m => m.user_id === actorId && !m.leftAt,
    );
    const finalPerms = applyOverrides(teamPerms, membership?.permission_overrides as any);

    return hasPermission(finalPerms as any, required);
  }

  // ── Helpers ──────────────────────────────────────────

  /**
   * Find the user's active contract for a given company.
   */
  async findActiveContract(
    userId: TUserId,
    companyId: TCompanyId,
  ): Promise<TContractRecord | null> {
    return this.contractRepo.findOne({ filter: { user_id: userId, company_id: companyId, status: 'active' } as any });
  }

  /**
   * Get all contract roles for a user in a company.
   * Useful for the workspace switcher and context resolution.
   */
  async getContractRoles(
    userId: TUserId,
    companyId: TCompanyId,
  ): Promise<TContractRole[]> {
    const contract = await this.findActiveContract(userId, companyId);
    return contract?.roles ?? [];
  }
}

// ── Pure functions (exported for testing) ──────────────

/** Expand contract roles to their permission sets via ROLE_TEMPLATES */
export function expandContractRoles(roles: TContractRole[]): TPermission[] {
  const perms = new Set<TPermission>();
  for (const role of roles) {
    const template = ROLE_TEMPLATES[role];
    if (template) template.forEach(p => perms.add(p));
  }
  return [...perms];
}

/** Expand a team role to its permission set via TEAM_ROLE_TEMPLATES */
export function expandTeamRole(role: string): string[] {
  const template = TEAM_ROLE_TEMPLATES[role as keyof typeof TEAM_ROLE_TEMPLATES];
  return template ? [...template] : [];
}

/** Apply permission overrides (grant/revoke) on top of a base set */
export function applyOverrides(
  base: TPermission[],
  overrides?: { grant?: TPermission[]; revoke?: TPermission[] },
): TPermission[] {
  if (!overrides) return base;

  let result = [...base];

  // Add granted permissions
  if (overrides.grant) {
    for (const p of overrides.grant) {
      if (!result.includes(p)) result.push(p);
    }
  }

  // Remove revoked permissions (exact match only, not wildcard)
  if (overrides.revoke) {
    result = result.filter(p => !overrides.revoke!.includes(p));
  }

  return result;
}
