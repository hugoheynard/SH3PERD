import { z } from 'zod';
import type { ZodOutput } from './utils/zod.types.js';
import type { TRecordMetadata } from './metadata.types.js';
import {
  SUserId,       type TUserId,
  SCompanyId,    type TCompanyId,
  SServiceId,    type TServiceId,
  SContractId,   type TContractId,
  STeamId,       type TTeamId,
  SCastMembershipEventId, type TCastMembershipEventId,
} from './ids.js';


// ─── Company Admin Role ────────────────────────────────────

/**
 * Permission level granted to a company admin.
 * - `admin`  — full write access (manage teams, services, contracts)
 * - `viewer` — read-only access
 */
export type TCompanyAdminRole = 'admin' | 'viewer';
export const SCompanyAdminRole: ZodOutput<TCompanyAdminRole> =
  z.enum(['admin', 'viewer']);


// ─── Company Admin ─────────────────────────────────────────

/** A user who has been granted administrative access to a company. */
export interface TCompanyAdmin {
  /** Reference to the user account */
  user_id: TUserId;
  /** Permission level granted */
  role: TCompanyAdminRole;
  /** Timestamp when access was granted */
  joinedAt: Date;
}
export const SCompanyAdmin: ZodOutput<TCompanyAdmin> = z.object({
  user_id:  SUserId,
  role:     SCompanyAdminRole,
  joinedAt: z.coerce.date(),
});


// ─── Company Status ────────────────────────────────────────

/**
 * Lifecycle status of a company.
 * - `pending`   — created but not yet activated
 * - `active`    — fully operational
 * - `suspended` — temporarily disabled
 */
export type TCompanyStatus = 'pending' | 'active' | 'suspended';
export const SCompanyStatus: ZodOutput<TCompanyStatus> =
  z.enum(['pending', 'active', 'suspended']);


// ─── Service Communication ─────────────────────────────────

/**
 * Communication platform for a service channel.
 * Used to link a Slack channel, WhatsApp group, Teams channel, etc.
 */
export type TCommunicationPlatform =
  | 'slack'
  | 'whatsapp'
  | 'teams'
  | 'discord'
  | 'telegram'
  | 'other';

export const SCommunicationPlatform: ZodOutput<TCommunicationPlatform> =
  z.enum(['slack', 'whatsapp', 'teams', 'discord', 'telegram', 'other']);

/** A communication channel link attached to a service */
export interface TServiceCommunication {
  /** Platform hosting the channel */
  platform: TCommunicationPlatform;
  /** Invite or direct link to the channel/group */
  url: string;
}
export const SServiceCommunication: ZodOutput<TServiceCommunication> = z.object({
  platform: SCommunicationPlatform,
  url:      z.string().url(),
});


// ─── Service ───────────────────────────────────────────────

/**
 * A functional department or division within a company.
 * Services group teams under a named scope (e.g. "Kitchen", "Bar", "Events").
 */
export interface TService {
  /** Unique identifier, prefixed `service_` */
  id: TServiceId;
  /** Display name shown in the UI */
  name: string;
  /** Optional display color as a hex string — e.g. `#63b3ed` */
  color?: string;
  /** Optional communication channel (Slack, WhatsApp, Teams…) */
  communication?: TServiceCommunication;
}
export const SService: ZodOutput<TService> = z.object({
  id:            SServiceId,
  name:          z.string().min(1),
  color:         z.string().optional(),
  communication: SServiceCommunication.optional(),
});


// ─── Company Address ───────────────────────────────────────

/** Physical address of a company. All fields are optional. */
export interface TCompanyAddress {
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
}
export const SCompanyAddress: ZodOutput<TCompanyAddress> = z.object({
  street:  z.string().optional(),
  city:    z.string().optional(),
  zip:     z.string().optional(),
  country: z.string().optional(),
});


// ─── Company Domain Model ──────────────────────────────────

/**
 * Core domain model for a company.
 * Persisted as a MongoDB document in the `companies` collection.
 */
export interface TCompanyDomainModel {
  /** Unique identifier, prefixed `company_` */
  id: TCompanyId;
  /** Display name */
  name: string;
  /** User who created and owns the company */
  owner_id: TUserId;
  description?: string;
  address?: TCompanyAddress;
  /** Departments / divisions within this company */
  services: TService[];
  /** Users with administrative access */
  admins: TCompanyAdmin[];
  status: TCompanyStatus;
}
export const SCompanyDomainModel: ZodOutput<TCompanyDomainModel> = z.object({
  id:          SCompanyId,
  name:        z.string().min(1),
  owner_id:    SUserId,
  description: z.string().optional(),
  address:     SCompanyAddress.optional(),
  services:    z.array(SService).default([]),
  admins:      z.array(SCompanyAdmin).default([]),
  status:      SCompanyStatus.default('active'),
});

/** MongoDB record — domain model extended with audit metadata */
export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;


// ─── Team Status ───────────────────────────────────────────

/**
 * Lifecycle status of a team.
 * - `active`   — operational, accepting members
 * - `archived` — closed, retained for audit trail
 */
export type TTeamStatus = 'active' | 'archived';
export const STeamStatusEnum: ZodOutput<TTeamStatus> =
  z.enum(['active', 'archived']);


// ─── Team Member ───────────────────────────────────────────

/**
 * Records a single membership window for a user within a team.
 * A user can have multiple entries if they leave and rejoin.
 * `leftAt` is absent while the member is still active.
 */
export interface TTeamMember {
  /** The member's user account */
  user_id: TUserId;
  /** The contract governing this membership period */
  contract_id: TContractId;
  /** When the user joined this team */
  joinedAt: Date;
  /** When the user left — absent if still active */
  leftAt?: Date;
}
export const STeamMember: ZodOutput<TTeamMember> = z.object({
  user_id:     SUserId,
  contract_id: SContractId,
  joinedAt:    z.coerce.date(),
  leftAt:      z.coerce.date().optional(),
});


// ─── Team Domain Model ─────────────────────────────────────

/**
 * A team groups staff members under a service.
 * Teams are the primary unit of scheduling and contract assignment.
 */
export interface TTeamDomainModel {
  /** Unique identifier, prefixed `team_` */
  id: TTeamId;
  /** Parent company */
  company_id: TCompanyId;
  /** Display name */
  name: string;
  /**
   * Parent service — a team can exist without a service.
   * When set, the team appears in the service org chart.
   */
  service_id?: TServiceId;
  /** Full membership history — active and past members */
  members: TTeamMember[];
  status: TTeamStatus;
}
export const STeamDomainModel: ZodOutput<TTeamDomainModel> = z.object({
  id:         STeamId,
  company_id: SCompanyId,
  name:       z.string().min(1),
  service_id: SServiceId.optional(),
  members:    z.array(STeamMember).default([]),
  status:     STeamStatusEnum.default('active'),
});

/** MongoDB record — domain model extended with audit metadata */
export type TTeamRecord = TTeamDomainModel & TRecordMetadata;


// ─── Cast Membership Event (audit trail) ───────────────────

/**
 * The action recorded in a team membership event.
 * - `member_added`   — a user joined the team
 * - `member_removed` — a user left or was removed
 */
export type TCastMembershipEventType = 'member_added' | 'member_removed';
export const SCastMembershipEventType: ZodOutput<TCastMembershipEventType> =
  z.enum(['member_added', 'member_removed']);

/**
 * Immutable audit event recording a membership change within a team.
 * Used to reconstruct the full history of who was in a team and when.
 */
export interface TCastMembershipEvent {
  id: TCastMembershipEventId;
  /** The team affected */
  cast_id: TTeamId;
  /** The user whose membership changed */
  user_id: TUserId;
  type: TCastMembershipEventType;
  /** When the event occurred */
  date: Date;
  /** The user who performed the action */
  by: TUserId;
  /** Optional human-readable reason — e.g. "end of season" */
  reason?: string;
}
export const SCastMembershipEvent: ZodOutput<TCastMembershipEvent> = z.object({
  id:      SCastMembershipEventId,
  cast_id: STeamId,
  user_id: SUserId,
  type:    SCastMembershipEventType,
  date:    z.coerce.date(),
  by:      SUserId,
  reason:  z.string().optional(),
});

/** MongoDB record — event extended with audit metadata */
export type TCastMembershipEventRecord = TCastMembershipEvent & TRecordMetadata;


// ─── View Models ───────────────────────────────────────────
// Read-only projections returned by use cases to the API layer.
// These are never parsed from external input — no schemas needed.

/** A team member as seen from a team view (active only) */
export interface TTeamMemberViewModel {
  user_id: TUserId;
  contract_id: TContractId;
  joinedAt: Date;
  leftAt?: Date;
}

/** A team as seen from the company detail view */
export interface TTeamViewModel {
  id: TTeamId;
  company_id: TCompanyId;
  name: string;
  service_id?: TServiceId;
  status: TTeamStatus;
  activeMembers: TTeamMemberViewModel[];
}

/** Minimal company projection — used for lists and store updates */
export interface TCompanyViewModel {
  id: TCompanyId;
  name: string;
  services: TService[];
}

/** Full company projection returned by the detail endpoint */
export interface TCompanyDetailViewModel {
  id: TCompanyId;
  name: string;
  owner_id: TUserId;
  status: TCompanyStatus;
  description?: string;
  address?: TCompanyAddress;
  services: TService[];
  admins: TCompanyAdmin[];
  activeTeamCount: number;
  activeContractCount: number;
}

/** Company projection used in list / card views */
export interface TCompanyCardViewModel {
  id: TCompanyId;
  name: string;
  status: TCompanyStatus;
  adminCount: number;
  createdAt: Date;
}

/** A member as seen from a service detail view */
export interface TServiceMemberViewModel {
  user_id: TUserId;
  first_name?: string;
  last_name?: string;
  contract_id: TContractId;
  joinedAt: Date;
}

/** A team as seen from a service detail view */
export interface TServiceTeamViewModel {
  id: TTeamId;
  name: string;
  status: TTeamStatus;
  members: TServiceMemberViewModel[];
}

/** Full service projection — includes its teams and their active members */
export interface TServiceDetailViewModel {
  service_id: TServiceId;
  name: string;
  /** Display color as a hex string — e.g. `#63b3ed` */
  color?: string;
  /** Optional communication channel link */
  communication?: TServiceCommunication;
  teams: TServiceTeamViewModel[];
}

/**
 * Full company org chart — one call, all levels.
 * Services list their teams, teams list their active members.
 * @see TODO.md — lazy loading per service for large organisations
 */
export interface TCompanyOrgChartViewModel {
  company_id: TCompanyId;
  company_name: string;
  /** Services sorted by name, each carrying their teams */
  services: TServiceDetailViewModel[];
  /** Teams not attached to any service */
  unassignedTeams: TServiceTeamViewModel[];
}


// ─── Re-exports ────────────────────────────────────────────
export {
  SCompanyId,              type TCompanyId,
  SServiceId,              type TServiceId,
  STeamId,                 type TTeamId,
  SCastMembershipEventId,  type TCastMembershipEventId,
} from './ids.js';
