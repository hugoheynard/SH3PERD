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

// ─── Permission Registry Object ─────────────────────────
//
// Single source of truth for all permissions in the system.
// Nested structure: P.Domain.Resource.Action → 'domain:resource:action'
//
// Usage:
//   @RequirePermission(P.Company.Settings.Write)
//   ROLE_TEMPLATES: { admin: [P.Company.Settings.Read, P.Music.Playlist.Read] }

/**
 * All permissions in the system, organized by domain > resource > action.
 *
 * This object IS the permission registry:
 * - Add a permission here → it exists in the system
 * - Remove it → TypeScript errors everywhere it was used
 * - Rename it → one place to change
 *
 * `TPermission` is derived from this object's values.
 */
export const P = {
  Company: {
    Settings: {
      Read:   'company:settings:read',
      Write:  'company:settings:write',
      Delete: 'company:settings:delete',
    },
    Members: {
      Read:   'company:members:read',
      Write:  'company:members:write',
      Invite: 'company:members:invite',
    },
    OrgChart: {
      Read:   'company:orgchart:read',
      Write:  'company:orgchart:write',
    },
  },
  Music: {
    Playlist: {
      Read:   'music:playlist:read',
      Write:  'music:playlist:write',
      Delete: 'music:playlist:delete',
      Own:    'music:playlist:own',
    },
    Setlist: {
      Read:   'music:setlist:read',
      Write:  'music:setlist:write',
    },
    Library: {
      Read:   'music:library:read',
      Write:  'music:library:write',
    },
    Track: {
      Read:   'music:track:read',
      Write:  'music:track:write',
      Delete: 'music:track:delete',
    },
  },
  Event: {
    Planning: {
      Read:   'event:planning:read',
      Write:  'event:planning:write',
    },
  },
} as const;

// ─── TPermission type (derived from P) ──────────────────

/** Recursively extract all leaf string values from a nested const object. */
type DeepLeafValues<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? { [K in keyof T]: DeepLeafValues<T[K]> }[keyof T]
    : never;

/**
 * Union of all valid permission strings, derived from the `P` object.
 * Also includes wildcard forms for use in ROLE_TEMPLATES.
 */
type TPermissionExact = DeepLeafValues<typeof P>;

/** Extract all unique domain prefixes from exact permissions. */
type ExtractDomain<S extends string> = S extends `${infer D}:${string}:${string}` ? D : never;
type PermDomainValues = ExtractDomain<TPermissionExact>;

export type TPermission =
  | TPermissionExact
  | '*'
  | `${PermDomainValues}:*`
  | `${PermDomainValues}:*:${string}`
  ;


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
export const SPermissionOverride = z.object({
  grant: z.array(z.string()).default([]),
  revoke: z.array(z.string()).default([]),
}) as unknown as ZodOutput<TPermissionOverride>;

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
 * Uses the `P` object for exact permissions and string wildcards
 * for broad grants (e.g. `company:*` = all company permissions).
 */
export const ROLE_TEMPLATES: Record<TContractRole, TPermission[]> = {
  owner: ['*'],
  admin: [
    'company:*',
    'music:*:read',
    'event:*',
    P.Company.Members.Invite,
  ],
  artist: [
    P.Music.Playlist.Own,
    P.Music.Setlist.Read,
    P.Music.Library.Read,
    P.Music.Library.Write,
    P.Music.Track.Read,
    P.Music.Track.Write,
    P.Event.Planning.Read,
    P.Company.OrgChart.Read,
    P.Company.Members.Read,
  ],
  viewer: [
    P.Music.Playlist.Read,
    P.Music.Library.Read,
    P.Music.Track.Read,
    P.Event.Planning.Read,
    P.Company.Settings.Read,
    P.Company.OrgChart.Read,
    P.Company.Members.Read,
  ],
} as const;

// ─── Account Type ──────────────────────────────────────
/**
 * Determined at registration, never changes.
 * An artist who needs company features creates a separate company account.
 */
export type TAccountType = 'artist' | 'company';
export const SAccountType: ZodOutput<TAccountType> =
  z.enum(['artist', 'company']);

// ─── Platform Roles (SaaS subscription plans) ────────────

/**
 * Artist plans — personal music library, playlists, audio processing.
 */
export type TArtistPlan = 'artist_free' | 'artist_pro' | 'artist_max';
export const SArtistPlan: ZodOutput<TArtistPlan> =
  z.enum(['artist_free', 'artist_pro', 'artist_max']);

/**
 * Company plans — organisation, events, integrations, team management.
 */
export type TCompanyPlan = 'company_free' | 'company_pro' | 'company_business';
export const SCompanyPlan: ZodOutput<TCompanyPlan> =
  z.enum(['company_free', 'company_pro', 'company_business']);

/**
 * Platform-level roles representing SaaS subscription plans.
 * Each user gets a platform contract at registration with one of these roles.
 * Disjoint from TContractRole — the two never mix in the same contract.
 *
 * Two families:
 * - Artist:  artist_free → artist_pro → artist_max
 * - Company: company_free → company_pro → company_business
 */
export type TPlatformRole = TArtistPlan | TCompanyPlan;
export const SPlatformRole: ZodOutput<TPlatformRole> =
  z.enum([
    'artist_free', 'artist_pro', 'artist_max',
    'company_free', 'company_pro', 'company_business',
  ]);

/**
 * Permission templates for platform roles.
 *
 * Artist plans: music-focused permissions + quotas.
 * Company plans: organisation + events + music access via company scope.
 *
 * Quantity limits (50 songs, 3 masters/month) are enforced by
 * QuotaService, NOT by the permission system. The permission layer
 * answers "can you do this action at all?", quotas answer
 * "have you exceeded your allowance?".
 */
export const PLATFORM_ROLE_TEMPLATES: Record<TPlatformRole, TPermission[]> = {
  // ── Artist plans ──────────────────────────────────────
  artist_free: [
    P.Music.Library.Read,
    P.Music.Library.Write,
    P.Music.Track.Read,
    P.Music.Track.Write,
    P.Music.Track.Delete,
    P.Music.Playlist.Read,
    P.Music.Playlist.Write,
    P.Music.Playlist.Delete,
    P.Music.Playlist.Own,
  ],
  artist_pro: [
    'music:*',
  ],
  artist_max: [
    'music:*',
    'event:*',
  ],

  // ── Company plans ─────────────────────────────────────
  company_free: [
    P.Company.Settings.Read,
    P.Company.Settings.Write,
    P.Company.Members.Read,
    P.Company.Members.Write,
    P.Company.Members.Invite,
    P.Company.OrgChart.Read,
    P.Company.OrgChart.Write,
  ],
  company_pro: [
    'company:*',
    'event:*',
    'music:*:read',
    P.Music.Playlist.Write,
    P.Music.Playlist.Delete,
    P.Music.Playlist.Own,
  ],
  company_business: [
    '*',
  ],
} as const;

/**
 * Default permission sets for each team-level role.
 * These use a simplified format (no domain prefix) because the domain
 * is resolved from the team's `type` at runtime (e.g. `music:playlist:read`).
 *
 * Format: `resource:action` or `*:action` or `*`
 */
export type TTeamPermission = string & { readonly __brand?: 'TeamPermission' };

export const TEAM_ROLE_TEMPLATES: Record<TTeamRole, TTeamPermission[]> = {
  director: ['*', 'members:read', 'members:write', 'members:invite'],
  manager: ['*:read', '*:write', '*:delete', 'members:read'],
  member: ['*:own'],
  viewer: ['*:read'],
} as const;
