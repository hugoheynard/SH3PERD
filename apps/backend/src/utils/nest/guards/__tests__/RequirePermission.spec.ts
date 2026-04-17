import {
  PermissionGuard,
  expandRolesToPermissions,
  matchPermission,
} from '../RequirePermission.js';
import type { Reflector } from '@nestjs/core';
import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { jest } from '@jest/globals';
import type { TContractRole, TPermission } from '@sh3pherd/shared-types';

/*
 * Guard + helpers for `@RequirePermission(...)`.
 *
 * Covers three surfaces:
 *
 * 1. PermissionGuard runtime — the actual 403 gate that protects every
 *    `@ContractScoped() @RequirePermission(...)` endpoint. Unit tests
 *    on the guard cover the full decision tree because E2E bypasses
 *    all guards; without this spec a regression wouldn't surface
 *    anywhere.
 * 2. expandRolesToPermissions — lookup in ROLE_TEMPLATES /
 *    PLATFORM_ROLE_TEMPLATES, silent drop on unknown roles.
 * 3. matchPermission — wildcard matcher. This is where subtle bugs
 *    like "short prefix grants everything beneath it" can hide.
 */

function mockCtx(options: { roles?: TContractRole[]; required?: TPermission[] | undefined }): {
  ctx: ExecutionContext;
  reflector: Reflector;
  handler: () => unknown;
} {
  const handler = jest.fn();
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(options.required),
  } as unknown as Reflector;
  const ctx = {
    switchToHttp: () => ({
      getRequest: () => ({ contract_roles: options.roles }),
    }),
    getHandler: () => handler,
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
  return { ctx, reflector, handler };
}

describe('PermissionGuard', () => {
  /* ── Pass-through paths ──────────────────────────── */

  it('should pass through when no metadata is set (route not @RequirePermission)', () => {
    const { ctx, reflector } = mockCtx({ required: undefined, roles: [] });
    const guard = new PermissionGuard(reflector);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should pass through when the required permissions list is empty', () => {
    const { ctx, reflector } = mockCtx({ required: [], roles: [] });
    const guard = new PermissionGuard(reflector);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  /* ── Role-based grants (happy path) ──────────────── */

  it('should grant ANY permission when the user has the "owner" role (wildcard *)', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['owner'],
      required: ['company:settings:write', 'music:library:delete'],
    });
    const guard = new PermissionGuard(reflector);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should grant a "company:*" request when the user has "admin" role (company:* wildcard)', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['admin'],
      required: ['company:settings:write'],
    });
    const guard = new PermissionGuard(reflector);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should grant a read-only permission when the user has "viewer" role', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['viewer'],
      required: ['music:library:read'],
    });
    const guard = new PermissionGuard(reflector);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  /* ── Role-based denials (the tenant-isolation teeth) ── */

  it('should throw ForbiddenException when "viewer" tries a write action', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['viewer'],
      required: ['music:library:write'],
    });
    const guard = new PermissionGuard(reflector);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow(
      /Missing required permission.*music:library:write/,
    );
  });

  it('should throw ForbiddenException when the user has NO contract_roles attached', () => {
    // Regression guard: a route protected with @RequirePermission but
    // NOT decorated with @ContractScoped would have no contract_roles.
    // The guard must fail closed (deny) — never fail open.
    const { ctx, reflector } = mockCtx({
      roles: undefined,
      required: ['music:library:read'],
    });
    const guard = new PermissionGuard(reflector);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny when the user has roles but NONE grant the required permission', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['viewer'],
      required: ['music:library:delete'],
    });
    const guard = new PermissionGuard(reflector);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  /* ── Multi-permission semantics: ALL required must be granted ── */

  it('should require ALL listed permissions (not just one) — grants when user has every one', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['artist'],
      required: ['music:library:read', 'music:library:write'],
    });
    const guard = new PermissionGuard(reflector);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny when ONE of the required permissions is missing', () => {
    // "artist" role grants music:library:* but nothing in company:*.
    const { ctx, reflector } = mockCtx({
      roles: ['artist'],
      required: ['music:library:read', 'company:settings:write'],
    });
    const guard = new PermissionGuard(reflector);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    // Error message should list the required set so ops can debug quickly.
    expect(() => guard.canActivate(ctx)).toThrow(
      /Missing required permission.*music:library:read.*company:settings:write/,
    );
  });

  /* ── Reflector contract ─────────────────────────── */

  it('should read metadata from both handler and class (getAllAndOverride)', () => {
    const { ctx, reflector } = mockCtx({
      roles: ['owner'],
      required: ['music:library:read'],
    });
    const guard = new PermissionGuard(reflector);

    guard.canActivate(ctx);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      'required_permission',
      expect.any(Array),
    );
  });
});

/* ══════════════════════════════════════════════════════
 * expandRolesToPermissions
 * ════════════════════════════════════════════════════ */

describe('expandRolesToPermissions', () => {
  it('should return [] for an empty role list', () => {
    expect(expandRolesToPermissions([])).toEqual([]);
  });

  it('should expand a contract role via ROLE_TEMPLATES', () => {
    const perms = expandRolesToPermissions(['owner']);
    // owner is the single wildcard '*'
    expect(perms).toContain('*');
  });

  it('should expand a platform role via PLATFORM_ROLE_TEMPLATES', () => {
    // `artist_free` is a platform role; should expand to its music library
    // permission set even though it isn't in ROLE_TEMPLATES.
    const perms = expandRolesToPermissions(['artist_free']);
    expect(perms).toContain('music:library:read');
    expect(perms).toContain('music:library:write');
    // But should NOT leak into company permissions
    expect(perms).not.toContain('company:settings:write');
  });

  it('should merge permissions across mixed contract + platform roles (deduped)', () => {
    // `artist_free` grants music:library:read; `viewer` also grants it —
    // the resulting flat list should contain it once.
    const perms = expandRolesToPermissions(['artist_free', 'viewer']);
    const occurrences = perms.filter((p) => p === 'music:library:read');
    expect(occurrences).toHaveLength(1);
    // And picks up the extras from both sides
    expect(perms).toContain('music:library:write'); // from artist_free
    expect(perms).toContain('company:settings:read'); // from viewer
  });

  it('should silently drop unknown roles instead of throwing', () => {
    // Fail-safe behaviour: an unknown role (typo, stale seed data) must
    // not crash the pipeline — the user just ends up with fewer perms
    // and the permission guard denies.
    const perms = expandRolesToPermissions(['not_a_real_role' as TContractRole]);
    expect(perms).toEqual([]);
  });
});

/* ══════════════════════════════════════════════════════
 * matchPermission (wildcard matcher)
 * ════════════════════════════════════════════════════ */

describe('matchPermission', () => {
  /* ── Global wildcard ───────────────────────────── */

  it('should match anything when granted is "*"', () => {
    expect(matchPermission('*', 'company:settings:write')).toBe(true);
    expect(matchPermission('*', 'music:library:read')).toBe(true);
    expect(matchPermission('*', '*')).toBe(true);
  });

  /* ── Exact match ───────────────────────────────── */

  it('should match on exact string equality', () => {
    expect(matchPermission('music:library:read', 'music:library:read')).toBe(true);
  });

  /* ── Domain-level wildcard (e.g. "company:*") ── */

  it('should match domain wildcards like "company:*"', () => {
    expect(matchPermission('company:*', 'company:settings:write')).toBe(true);
    expect(matchPermission('company:*', 'company:members:invite')).toBe(true);
  });

  it('should NOT let a domain wildcard cross domains', () => {
    expect(matchPermission('company:*', 'music:library:read')).toBe(false);
    expect(matchPermission('music:*', 'company:settings:write')).toBe(false);
  });

  /* ── Middle-segment wildcard (e.g. "music:*:read") ── */

  it('should match a single middle segment with "music:*:read"', () => {
    expect(matchPermission('music:*:read', 'music:library:read')).toBe(true);
    expect(matchPermission('music:*:read', 'music:playlist:read')).toBe(true);
  });

  it('should NOT match when the non-wildcard tail differs', () => {
    expect(matchPermission('music:*:read', 'music:library:write')).toBe(false);
  });

  it('should NOT match when a middle wildcard tries to span multiple segments', () => {
    // Middle `*` replaces exactly one segment — not a greedy match.
    expect(matchPermission('music:*:read', 'music:a:b:read')).toBe(false);
  });

  /* ── Trailing wildcard (e.g. "music:playlist:*") ── */

  it('should match any action under a resource with "music:playlist:*"', () => {
    expect(matchPermission('music:playlist:*', 'music:playlist:read')).toBe(true);
    expect(matchPermission('music:playlist:*', 'music:playlist:write')).toBe(true);
    expect(matchPermission('music:playlist:*', 'music:playlist:delete')).toBe(true);
  });

  it('should NOT match a different resource with a trailing wildcard', () => {
    expect(matchPermission('music:playlist:*', 'music:library:read')).toBe(false);
  });

  /* ── Length semantics ──────────────────────────── */

  it('should NOT match when granted has MORE segments than required (strictly longer pattern)', () => {
    // granted='music:playlist:read:extra' is more specific than any real
    // permission with 3 segments — should not match.
    expect(matchPermission('music:playlist:read:extra' as TPermission, 'music:playlist:read')).toBe(
      false,
    );
  });

  it('[documented behaviour] a prefix without wildcard is treated as prefix-match', () => {
    /*
     * Walking the algorithm: granted `music:playlist` (parts=2), required
     * `music:playlist:read` (parts=3):
     *   i=0: music == music, continue
     *   i=1: playlist == playlist, continue
     *   loop ends, return grantedParts.length (2) <= requiredParts.length (3) => TRUE
     *
     * This means a role granting a prefix without `*` would implicitly
     * cover anything below it. In practice every template uses explicit
     * wildcards (`music:*`, `music:playlist:*`) so this path is not
     * reachable via real templates — but the function itself has this
     * property. Locking it in so any algorithm change is conscious.
     *
     * If we decide this behaviour is risky, matchPermission should
     * require the equality branch to demand matching lengths, or force
     * a trailing `*`.
     */
    expect(matchPermission('music:playlist' as TPermission, 'music:playlist:read')).toBe(true);
  });
});
