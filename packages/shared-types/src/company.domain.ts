import { z } from 'zod';
import type { ZodOutput } from './utils/zod.types.js';
import type { TRecordMetadata } from './metadata.types.js';
import {
  SUserId,       type TUserId,
  SCompanyId,    type TCompanyId,
  SContractId,   type TContractId,
  SOrgNodeId,    type TOrgNodeId,
  SOrgMembershipEventId, type TOrgMembershipEventId,
} from './ids.js';
import {
  STeamRole, type TTeamRole,
  STeamType, type TTeamType,
  SPermissionOverride, type TPermissionOverride,
} from './permissions.types.js';


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


// ─── Communication ─────────────────────────────────────────

/**
 * Communication platform for an org node channel.
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

/** A communication channel link attached to an org node */
export interface TOrgNodeCommunication {
  /** Platform hosting the channel */
  platform: TCommunicationPlatform;
  /** Invite or direct link to the channel/group */
  url: string;
}
export const SOrgNodeCommunication: ZodOutput<TOrgNodeCommunication> = z.object({
  platform: SCommunicationPlatform,
  url:      z.string().url(),
});

/** @deprecated Use TOrgNodeCommunication */
export type TTeamCommunication = TOrgNodeCommunication;
/** @deprecated Use SOrgNodeCommunication */
export const STeamCommunication = SOrgNodeCommunication;

/**
 * Connection status of a platform integration.
 * - `not_connected` — no credentials, not usable yet
 * - `connected`     — credentials stored, channels can be created
 */
export type TIntegrationStatus = 'not_connected' | 'connected';
export const SIntegrationStatus: ZodOutput<TIntegrationStatus> =
  z.enum(['not_connected', 'connected']);

/**
 * A company-level platform integration (Slack workspace, WhatsApp Business, etc.).
 * Must be connected before channels from this platform can be created.
 *
 * `config` holds platform-specific credentials:
 * - Slack:    `{ webhook_url }` (later: OAuth token)
 * - WhatsApp: `{ invite_base_url }` (later: Business API key)
 * - Telegram: `{ bot_token }` (later: full Bot API)
 * - Discord:  `{ server_invite }` (later: Bot token)
 * - Teams:    `{ tenant_id }` (later: Graph API)
 */
export interface TCompanyIntegration {
  platform: TCommunicationPlatform;
  status: TIntegrationStatus;
  /** Platform-specific config — opaque key-value for now */
  config: Record<string, string>;
  connectedAt?: Date;
}
export const SCompanyIntegration: ZodOutput<TCompanyIntegration> = z.object({
  platform:    SCommunicationPlatform,
  status:      SIntegrationStatus,
  config:      z.record(z.string()),
  connectedAt: z.coerce.date().optional(),
});

/**
 * A company-level communication channel registration.
 * These are the "available channels" that can be assigned to org nodes.
 * Requires the parent platform to be connected first.
 */
export interface TCompanyChannel {
  /** Unique id within the company */
  id: string;
  /** Human-readable label (e.g. "Slack — Design team") */
  name: string;
  /** Platform type (must match a connected integration) */
  platform: TCommunicationPlatform;
  /** Invite or direct link */
  url: string;
}
export const SCompanyChannel: ZodOutput<TCompanyChannel> = z.object({
  id:       z.string().min(1),
  name:     z.string().min(1),
  platform: SCommunicationPlatform,
  url:      z.string().url(),
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


// ─── Company Info ───────────────────────────────────────────

/**
 * Editable company information — the subset of fields
 * that can be updated via the "Infos" settings tab.
 * Used as the DTO shape for both frontend forms and backend commands.
 */
export interface TCompanyInfo {
  name: string;
  description: string;
  address: TCompanyAddress;
}
export const SCompanyInfo: ZodOutput<TCompanyInfo> = z.object({
  name:        z.string().min(1),
  description: z.string(),
  address:     SCompanyAddress,
});


// ─── Company Domain Model ──────────────────────────────────

/**
 * Core domain model for a company.
 * Persisted as a MongoDB document in the `companies` collection.
 *
 * **Note:** `admins` and `services` have been removed.
 * - Access control is managed through {@link TContractDomainModel.roles}
 * - Organizational hierarchy is managed through {@link TOrgNodeDomainModel}
 * - `orgLayers` defines the company-specific vocabulary for hierarchy levels
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
  /**
   * Display labels for each depth level in the org chart.
   * Index 0 = label for root nodes, index 1 = their children, etc.
   *
   * @example ["Direction", "Pôle", "Équipe"]
   */
  orgLayers: string[];
  /** Connected platform integrations (Slack, WhatsApp, etc.) */
  integrations: TCompanyIntegration[];
  /** Registered communication channels available for org nodes to use */
  channels: TCompanyChannel[];
  status: TCompanyStatus;
}
export const SCompanyDomainModel: ZodOutput<TCompanyDomainModel> = z.object({
  id:           SCompanyId,
  name:         z.string().min(1),
  owner_id:     SUserId,
  description:  z.string().optional(),
  address:      SCompanyAddress.optional(),
  orgLayers:    z.array(z.string()).default(['Department', 'Team', 'Sub-team']),
  integrations: z.array(SCompanyIntegration).default([]),
  channels:     z.array(SCompanyChannel).default([]),
  status:       SCompanyStatus.default('active'),
});

/** MongoDB record — domain model extended with audit metadata */
export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;


// ─── OrgNode Status ────────────────────────────────────────

/**
 * Lifecycle status of an org node.
 * - `active`   — operational, accepting members
 * - `archived` — closed, retained for audit trail
 */
export type TOrgNodeStatus = 'active' | 'archived';
export const SOrgNodeStatusEnum: ZodOutput<TOrgNodeStatus> =
  z.enum(['active', 'archived']);

/** @deprecated Use TOrgNodeStatus */
export type TTeamStatus = TOrgNodeStatus;
/** @deprecated Use SOrgNodeStatusEnum */
export const STeamStatusEnum = SOrgNodeStatusEnum;


// ─── OrgNode Member ────────────────────────────────────────

/**
 * Records a single membership window for a user within an org node.
 * A user can have multiple entries if they leave and rejoin.
 *
 * `team_role` determines what the member can do within this node.
 * `permission_overrides` allows fine-grained exceptions to the role template.
 * `leftAt` is absent while the member is still active.
 */
export interface TOrgNodeMember {
  /** The member's user account */
  user_id: TUserId;
  /** The contract governing this membership period */
  contract_id: TContractId;
  /** Role within this specific node — determines scoped permissions */
  team_role: TTeamRole;
  /** Per-user permission exceptions (enterprise-grade). Empty for POC. */
  permission_overrides?: TPermissionOverride;
  /** When the user joined this node */
  joinedAt: Date;
  /** When the user left — absent if still active */
  leftAt?: Date;
}
export const SOrgNodeMember: ZodOutput<TOrgNodeMember> = z.object({
  user_id:              SUserId,
  contract_id:          SContractId,
  team_role:            STeamRole,
  permission_overrides: SPermissionOverride.optional(),
  joinedAt:             z.coerce.date(),
  leftAt:               z.coerce.date().optional(),
});

/** @deprecated Use TOrgNodeMember */
export type TTeamMember = TOrgNodeMember;
/** @deprecated Use SOrgNodeMember */
export const STeamMember = SOrgNodeMember;


// ─── OrgNode Guest Member ─────────────────────────────────

/**
 * A display-only member on an org node — no user account, no contract.
 * Used for external representatives, placeholders, or org chart visualization.
 *
 * `team_role` is purely informational (no permission implications).
 */
export interface TOrgNodeGuestMember {
  /** Unique identifier within the node */
  id: string;
  /** Display name */
  display_name: string;
  /** Job title or function label */
  title?: string;
  /** Informational role — no permission implications */
  team_role: TTeamRole;
}
export const SOrgNodeGuestMember: ZodOutput<TOrgNodeGuestMember> = z.object({
  id:           z.string().min(1),
  display_name: z.string().min(1),
  title:        z.string().optional(),
  team_role:    STeamRole,
});


// ─── OrgNode Domain Model ──────────────────────────────────

/**
 * An OrgNode is a node in the company's organizational hierarchy.
 * It replaces both "services" and "teams" from previous models.
 *
 * The tree structure is defined by `parent_id` pointers:
 * - Root nodes (`parent_id: undefined`) are top-level (departments, divisions)
 *   and carry a `type` that maps to application feature sets.
 * - Child nodes inherit their parent's feature domain.
 *
 * Depth is computed at read time by walking the parent chain.
 * Display labels come from `company.orgLayers[depth]`.
 *
 * Permission inheritance: a manager of a parent node has manager access
 * to all child nodes. A direct membership overrides inherited role.
 */
export interface TOrgNodeDomainModel {
  /** Unique identifier, prefixed `orgnode_` */
  id: TOrgNodeId;
  /** Parent company */
  company_id: TCompanyId;
  /** Display name */
  name: string;
  /**
   * Parent node — `undefined` for root-level nodes.
   * When set, this node inherits the parent's feature domain.
   */
  parent_id?: TOrgNodeId;
  /**
   * Functional domain type — only meaningful on root-level nodes.
   * Maps to application feature sets (music, communication, event, etc.).
   */
  type?: TTeamType;
  /** Optional display color as a hex string — e.g. `#63b3ed` */
  color?: string;
  /** Communication channels linked to this node (Slack, WhatsApp, Teams...) */
  communications: TOrgNodeCommunication[];
  /** Full membership history — active and past members */
  members: TOrgNodeMember[];
  /** Display-only members — no user account, no permissions */
  guest_members: TOrgNodeGuestMember[];
  status: TOrgNodeStatus;
}
export const SOrgNodeDomainModel: ZodOutput<TOrgNodeDomainModel> = z.object({
  id:            SOrgNodeId,
  company_id:    SCompanyId,
  name:          z.string().min(1),
  parent_id:     SOrgNodeId.optional(),
  type:          STeamType.optional(),
  color:         z.string().optional(),
  communications: z.array(SOrgNodeCommunication).default([]),
  members:       z.array(SOrgNodeMember).default([]),
  guest_members: z.array(SOrgNodeGuestMember).default([]),
  status:        SOrgNodeStatusEnum.default('active'),
});

/** MongoDB record — domain model extended with audit metadata */
export type TOrgNodeRecord = TOrgNodeDomainModel & TRecordMetadata;

/** @deprecated Use TOrgNodeDomainModel */
export type TTeamDomainModel = TOrgNodeDomainModel;
/** @deprecated Use SOrgNodeDomainModel */
export const STeamDomainModel = SOrgNodeDomainModel;
/** @deprecated Use TOrgNodeRecord */
export type TTeamRecord = TOrgNodeRecord;


// ─── Org Membership Event (audit trail) ─────────────────────

/**
 * The action recorded in an org membership event.
 * - `member_added`   — a user joined the node
 * - `member_removed` — a user left or was removed
 */
export type TOrgMembershipEventType = 'member_added' | 'member_removed';
export const SOrgMembershipEventType: ZodOutput<TOrgMembershipEventType> =
  z.enum(['member_added', 'member_removed']);

/** @deprecated Use TOrgMembershipEventType */
export type TCastMembershipEventType = TOrgMembershipEventType;
/** @deprecated Use SOrgMembershipEventType */
export const SCastMembershipEventType = SOrgMembershipEventType;

/**
 * Immutable audit event recording a membership change within an org node.
 * Used to reconstruct the full history of who was in a node and when.
 */
export interface TOrgMembershipEvent {
  id: TOrgMembershipEventId;
  /** The org node affected */
  org_node_id: TOrgNodeId;
  /** The user whose membership changed */
  user_id: TUserId;
  type: TOrgMembershipEventType;
  /** When the event occurred */
  date: Date;
  /** The user who performed the action */
  by: TUserId;
  /** Optional human-readable reason — e.g. "end of season" */
  reason?: string;
}
export const SOrgMembershipEvent: ZodOutput<TOrgMembershipEvent> = z.object({
  id:          SOrgMembershipEventId,
  org_node_id: SOrgNodeId,
  user_id:     SUserId,
  type:        SOrgMembershipEventType,
  date:        z.coerce.date(),
  by:          SUserId,
  reason:      z.string().optional(),
});

/** MongoDB record — event extended with audit metadata */
export type TOrgMembershipEventRecord = TOrgMembershipEvent & TRecordMetadata;

/** @deprecated Use TOrgMembershipEvent */
export type TCastMembershipEvent = TOrgMembershipEvent;
/** @deprecated Use TOrgMembershipEventRecord */
export type TCastMembershipEventRecord = TOrgMembershipEventRecord;


// ─── View Models ───────────────────────────────────────────
// Read-only projections returned by query handlers to the API layer.
// These are never parsed from external input — no schemas needed.

/** An org node member as seen from a view */
export interface TOrgNodeMemberViewModel {
  user_id: TUserId;
  contract_id: TContractId;
  team_role: TTeamRole;
  joinedAt: Date;
  leftAt?: Date;
  /** Resolved from user profile — optional enrichment */
  first_name?: string;
  last_name?: string;
}

/** @deprecated Use TOrgNodeMemberViewModel */
export type TTeamMemberViewModel = TOrgNodeMemberViewModel;

/** An org node as seen from various views */
export interface TOrgNodeViewModel {
  id: TOrgNodeId;
  company_id: TCompanyId;
  name: string;
  parent_id?: TOrgNodeId;
  type?: TTeamType;
  color?: string;
  communications: TOrgNodeCommunication[];
  status: TOrgNodeStatus;
  activeMembers: TOrgNodeMemberViewModel[];
}

/** @deprecated Use TOrgNodeViewModel */
export type TTeamViewModel = TOrgNodeViewModel;

/** Minimal company projection — used for lists and store updates */
export interface TCompanyViewModel {
  id: TCompanyId;
  name: string;
  status: TCompanyStatus;
}

/** Full company projection returned by the detail endpoint */
export interface TCompanyDetailViewModel {
  id: TCompanyId;
  name: string;
  owner_id: TUserId;
  status: TCompanyStatus;
  description?: string;
  address?: TCompanyAddress;
  orgLayers: string[];
  integrations: TCompanyIntegration[];
  channels: TCompanyChannel[];
  activeTeamCount: number;
  activeContractCount: number;
}

/** Company projection used in list / card views */
export interface TCompanyCardViewModel {
  id: TCompanyId;
  name: string;
  status: TCompanyStatus;
  createdAt: Date;
}

/** Recursive tree node for the org hierarchy (org chart) */
export interface TOrgNodeHierarchyViewModel {
  id: TOrgNodeId;
  name: string;
  parent_id?: TOrgNodeId;
  type?: TTeamType;
  color?: string;
  communications: TOrgNodeCommunication[];
  status: TOrgNodeStatus;
  members: TOrgNodeMemberViewModel[];
  guest_members: TOrgNodeGuestMember[];
  children: TOrgNodeHierarchyViewModel[];
}

/** @deprecated Use TOrgNodeHierarchyViewModel */
export type TTeamHierarchyViewModel = TOrgNodeHierarchyViewModel;

/**
 * Full company org chart — one call, all levels.
 * Root nodes (parent_id: undefined) are top-level entries,
 * each carrying their children recursively.
 */
export interface TCompanyOrgChartViewModel {
  company_id: TCompanyId;
  company_name: string;
  orgLayers: string[];
  /** Root-level org nodes, each with nested children */
  rootNodes: TOrgNodeHierarchyViewModel[];
}


// ─── Re-exports ────────────────────────────────────────────
export {
  SCompanyId,              type TCompanyId,
  SOrgNodeId,              type TOrgNodeId,
  SOrgMembershipEventId,   type TOrgMembershipEventId,
  // Backward-compat aliases
  STeamId,                 type TTeamId,
  SCastMembershipEventId,  type TCastMembershipEventId,
} from './ids.js';
