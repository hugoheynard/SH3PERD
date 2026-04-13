import {
  applyDecorators,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import {
  ROLE_TEMPLATES,
  PLATFORM_ROLE_TEMPLATES,
  type TContractRole,
  type TPlatformRole,
  type TPermission,
} from '@sh3pherd/shared-types';

const REQUIRED_PERMISSION_KEY = 'required_permission';

// ── Permission Registry ────────────────────────────
//
// Auto-populated by @RequirePermission() at class-decoration time.
// Provides a runtime view of every permission used across the app.

const _registry = new Set<TPermission>();

/**
 * Global permission registry — every permission declared via @RequirePermission()
 * is automatically registered here at module evaluation time.
 *
 * @example
 * ```ts
 * // In an admin controller or a /debug endpoint:
 * PermissionRegistry.getAll();
 * // → ['company:settings:write', 'music:playlist:read', ...]
 * ```
 */
export const PermissionRegistry = {
  /** Register one or more permissions (called by @RequirePermission). */
  register(...permissions: TPermission[]): void {
    for (const p of permissions) _registry.add(p);
  },

  /** Returns all registered permissions, sorted alphabetically. */
  getAll(): TPermission[] {
    return [..._registry].sort();
  },

  /** Check if a specific permission has been declared anywhere. */
  has(permission: TPermission): boolean {
    return _registry.has(permission);
  },

  /** Number of unique permissions registered. */
  get size(): number {
    return _registry.size;
  },
} as const;

// ── Guard ──────────────────────────────────────────

/**
 * Guard that checks whether the current user's contract roles grant
 * the required permission(s).
 *
 * ## Resolution flow
 * 1. Read `request.contract_roles` (set by `ContractContextGuard`)
 * 2. Expand each role into permissions via `ROLE_TEMPLATES`
 * 3. Check if the expanded set matches the required permission (with wildcard support)
 *
 * ## Wildcard matching
 * - `*` matches everything
 * - `company:*` matches `company:settings:write`, `company:members:invite`, etc.
 * - `music:*:read` matches `music:playlist:read`, `music:setlist:read`, etc.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<TPermission[]>(
      REQUIRED_PERMISSION_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const roles: TContractRole[] = req.contract_roles ?? [];

    // Expand roles → permissions
    const grantedPermissions = expandRolesToPermissions(roles);

    // Check every required permission is granted
    const hasAll = requiredPermissions.every((required) =>
      grantedPermissions.some((granted) => matchPermission(granted, required)),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

// ── Decorator ──────────────────────────────────────

/**
 * Method/class decorator — requires the user to have the specified permission(s).
 * Must be used together with `@ContractScoped()` so that roles are resolved.
 *
 * Each permission passed is **automatically registered** in the global
 * `PermissionRegistry` at decoration time (module evaluation).
 *
 * @example
 * ```ts
 * @ContractScoped()
 * @RequirePermission('company:settings:write')
 * @Patch('settings')
 * updateSettings(...) { ... }
 *
 * // Multiple permissions (all must be granted)
 * @RequirePermission('music:playlist:write', 'music:setlist:read')
 * ```
 */
export function RequirePermission(...permissions: TPermission[]) {
  // Auto-register in the global registry
  PermissionRegistry.register(...permissions);

  return applyDecorators(
    SetMetadata(REQUIRED_PERMISSION_KEY, permissions),
    UseGuards(PermissionGuard),
    ApiResponse({
      status: 403,
      description: `Requires permission: ${permissions.join(', ')}`,
    }),
  );
}

// ── Permission helpers ─────────────────────────────

/**
 * Expand roles into a flat list of granted permissions.
 *
 * Checks BOTH `ROLE_TEMPLATES` (company roles: owner, admin, artist,
 * viewer) and `PLATFORM_ROLE_TEMPLATES` (SaaS plans: plan_free,
 * plan_pro, plan_band, plan_business). Since the two role sets are
 * disjoint strings, only one lookup matches per role.
 */
export function expandRolesToPermissions(roles: (TContractRole | TPlatformRole)[]): TPermission[] {
  const permissions = new Set<TPermission>();
  for (const role of roles) {
    // Check company role templates first
    const companyTemplate = ROLE_TEMPLATES[role as TContractRole];
    if (companyTemplate) {
      for (const p of companyTemplate) permissions.add(p);
      continue;
    }
    // Then check platform role templates
    const platformTemplate = PLATFORM_ROLE_TEMPLATES[role as TPlatformRole];
    if (platformTemplate) {
      for (const p of platformTemplate) permissions.add(p);
    }
  }
  return [...permissions];
}

/**
 * Check if a granted permission pattern matches a required permission.
 *
 * Supports wildcard segments:
 * - `*`                → matches anything
 * - `company:*`        → matches `company:settings:write`
 * - `music:*:read`     → matches `music:playlist:read`
 * - `music:playlist:*` → matches `music:playlist:read`, `music:playlist:write`
 */
export function matchPermission(granted: TPermission, required: TPermission): boolean {
  if (granted === '*') return true;
  if (granted === required) return true;

  const grantedParts = granted.split(':');
  const requiredParts = required.split(':');

  for (let i = 0; i < grantedParts.length; i++) {
    if (grantedParts[i] === '*') {
      if (i === grantedParts.length - 1) return true;
      continue;
    }
    if (i >= requiredParts.length) return false;
    if (grantedParts[i] !== requiredParts[i]) return false;
  }

  return grantedParts.length <= requiredParts.length;
}
