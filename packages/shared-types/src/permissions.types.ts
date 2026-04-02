import { z } from 'zod';
import type { ZodOutput } from './utils/zod.types.js';

// ─── Contract Roles ─────────────────────────────────────
/**
 * Roles a user can hold within a company via their contract.
 * A single contract can carry multiple roles (e.g. `["admin", "artist"]`).
 *
 * - `owner`  — created the company, full access, cannot be removed
 * - `admin`  — manages company settings, teams, contracts
 * - `artist` — active performer / contributor with a personal workspace
 * - `viewer` — read-only access to company data
 */
export type TContractRole = 'owner' | 'admin' | 'artist' | 'viewer';
export const SContractRole: ZodOutput<TContractRole> =
  z.enum(['owner', 'admin', 'artist', 'viewer']);

// ─── Team Roles ─────────────────────────────────────────
/**
 * Role of a member within a specific org node.
 * Determines what actions the member can perform on node-scoped data.
 *
 * - `director` — full authority over the node and its sub-tree
 * - `manager`  — CRUD on data of all node members
 * - `member`   — CRUD on own data only
 * - `viewer`   — read-only on node data
 */
export type TTeamRole = 'director' | 'manager' | 'member' | 'viewer';
export const STeamRole: ZodOutput<TTeamRole> =
  z.enum(['director', 'manager', 'member', 'viewer']);

// ─── Permission String ──────────────────────────────────
/**
 * Permission string in the format `domain:resource:action`.
 * Supports wildcards: `"music:*"` matches `"music:playlist:read"`.
 *
 * @example
 * "music:playlist:read"
 * "music:playlist:write"
 * "company:settings:write"
 * "company:members:invite"
 * "music:*"
 * "*"
 */
export type TPermission = string & { readonly __brand?: 'Permission' };

// ─── Permission Override ────────────────────────────────
/**
 * Per-user override on top of their role-derived permissions.
 * Applied after role template expansion.
 *
 * - `grant` — additional permissions not covered by the role template
 * - `revoke` — permissions to remove despite the role template granting them
 */
export interface TPermissionOverride {
  grant: TPermission[];
  revoke: TPermission[];
}
export const SPermissionOverride: ZodOutput<TPermissionOverride> = z.object({
  grant: z.array(z.string()).default([]),
  revoke: z.array(z.string()).default([]),
});

// ─── Team Type ──────────────────────────────────────────
/**
 * Functional domain type of a top-level team (formerly "service").
 * Maps to feature sets in the application.
 *
 * - `music`         — playlists, setlists, music library
 * - `communication` — social media, PR, press
 * - `event`         — planning, scheduling, logistics
 * - `general`       — default, no specific feature set
 */
export type TTeamType = 'music' | 'communication' | 'event' | 'general';
export const STeamType: ZodOutput<TTeamType> =
  z.enum(['music', 'communication', 'event', 'general']);

// ─── Role Templates ─────────────────────────────────────
/**
 * Default permission sets for each contract-level role.
 * These are expanded at runtime by the PermissionResolver.
 *
 * Enterprise-grade: override with `TPermissionOverride` on `TTeamMember`
 * for fine-grained, per-user exceptions.
 */
export const ROLE_TEMPLATES: Record<TContractRole, TPermission[]> = {
  owner: ['*'],
  admin: [
    'company:*',
    'music:*:read',
    'event:*',
    'company:members:invite',
  ],
  artist: [
    'music:playlist:own',
    'music:setlist:read',
    'event:planning:read',
  ],
  viewer: [
    'music:playlist:read',
    'event:planning:read',
    'company:settings:read',
  ],
} as const;

/**
 * Default permission sets for each team-level role.
 * These are scoped by the team's `type` at resolution time.
 */
export const TEAM_ROLE_TEMPLATES: Record<TTeamRole, TPermission[]> = {
  director: ['*', 'members:read', 'members:write', 'members:invite'],
  manager: ['*:read', '*:write', '*:delete', 'members:read'],
  member: ['*:own'],
  viewer: ['*:read'],
} as const;
