import { z } from 'zod';
import type { ZodOutput } from '../utils/zod.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import {
  SUserId,    type TUserId,
  SCompanyId,  type TCompanyId,
  SContractId, type TContractId,
  SOrgNodeId,  type TOrgNodeId,
} from '../ids.js';
import {
  STeamRole, type TTeamRole,
  STeamType, type TTeamType,
  SPermissionOverride, type TPermissionOverride,
} from '../permissions.types.js';
import type { TOrgNodeCommunication } from './communication.types.js';
import { SOrgNodeCommunication } from './communication.types.js';


// ─── OrgNode Status ────────────────────────────────────────

/**
 * Lifecycle status of an org node.
 * - `active`   — operational, accepting members
 * - `archived` — closed, retained for audit trail
 */
export type TOrgNodeStatus = 'active' | 'archived';
export const SOrgNodeStatusEnum: ZodOutput<TOrgNodeStatus> =
  z.enum(['active', 'archived']);


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


// ─── OrgNode Guest Member ──────────────────────────────────

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


// ─── OrgNode View Models ───────────────────────────────────
// Read-only projections returned by query handlers to the API layer.

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
