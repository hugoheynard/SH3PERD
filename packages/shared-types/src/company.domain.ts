/**
 * Barrel re-export for backward compatibility.
 *
 * This file used to contain all company-related types in a single 500+ line file.
 * It has been split into focused modules:
 *
 * - `communication.types.ts` — Platform, integration, channel types
 * - `company.types.ts`       — Company status, address, info, domain model, view models
 * - `orgnode.types.ts`       — OrgNode domain, members, guests, view models, org chart
 * - `membership-event.types.ts` — Audit trail types
 *
 * All public types are re-exported here so existing imports continue to work.
 */

// ── Communication ──────────────────────────────────────────
export {
  type TCommunicationPlatform,
  SCommunicationPlatform,
  type TIntegrationStatus,
  SIntegrationStatus,
  type TCompanyIntegration,
  SCompanyIntegration,
  type TCompanyChannel,
  SCompanyChannel,
  type TOrgNodeCommunication,
  SOrgNodeCommunication,
} from './company/communication.types.js';

// ── Company ────────────────────────────────────────────────
export {
  type TCompanyStatus,
  SCompanyStatus,
  type TCompanyAddress,
  SCompanyAddress,
  type TCompanyInfo,
  SCompanyInfo,
  type TCompanyDomainModel,
  SCompanyDomainModel,
  type TCompanyRecord,
  type TCompanyViewModel,
  type TCompanyDetailViewModel,
  type TCompanyCardViewModel,
} from './company/company.types.js';

// ── OrgNode ────────────────────────────────────────────────
export {
  type TOrgNodeStatus,
  SOrgNodeStatusEnum,
  type TOrgNodeMember,
  SOrgNodeMember,
  type TOrgNodeGuestMember,
  SOrgNodeGuestMember,
  type TOrgNodeDomainModel,
  SOrgNodeDomainModel,
  type TOrgNodeRecord,
  type TOrgNodeMemberViewModel,
  type TOrgNodeViewModel,
  type TOrgNodeHierarchyViewModel,
  type TCompanyOrgChartViewModel,
} from './company/orgnode.types.js';

// ── Membership Events ──────────────────────────────────────
export {
  type TOrgMembershipEventType,
  SOrgMembershipEventType,
  type TOrgMembershipEvent,
  SOrgMembershipEvent,
  type TOrgMembershipEventRecord,
} from './company/membership-event.types.js';


// ─── Deprecated Aliases ────────────────────────────────────
// Kept for backward compatibility — will be removed in a future version.

import type { TOrgNodeCommunication } from './company/communication.types.js';
import { SOrgNodeCommunication } from './company/communication.types.js';
import type { TOrgNodeStatus } from './company/orgnode.types.js';
import { SOrgNodeStatusEnum } from './company/orgnode.types.js';
import type { TOrgNodeMember } from './company/orgnode.types.js';
import { SOrgNodeMember } from './company/orgnode.types.js';
import type { TOrgNodeDomainModel } from './company/orgnode.types.js';
import { SOrgNodeDomainModel } from './company/orgnode.types.js';
import type { TOrgNodeRecord } from './company/orgnode.types.js';
import type { TOrgNodeMemberViewModel } from './company/orgnode.types.js';
import type { TOrgNodeViewModel } from './company/orgnode.types.js';
import type { TOrgNodeHierarchyViewModel } from './company/orgnode.types.js';
import type { TOrgMembershipEventType } from './company/membership-event.types.js';
import { SOrgMembershipEventType } from './company/membership-event.types.js';
import type { TOrgMembershipEvent } from './company/membership-event.types.js';
import type { TOrgMembershipEventRecord } from './company/membership-event.types.js';

/** @deprecated Use TOrgNodeCommunication */
export type TTeamCommunication = TOrgNodeCommunication;
/** @deprecated Use SOrgNodeCommunication */
export const STeamCommunication = SOrgNodeCommunication;

/** @deprecated Use TOrgNodeStatus */
export type TTeamStatus = TOrgNodeStatus;
/** @deprecated Use SOrgNodeStatusEnum */
export const STeamStatusEnum = SOrgNodeStatusEnum;

/** @deprecated Use TOrgNodeMember */
export type TTeamMember = TOrgNodeMember;
/** @deprecated Use SOrgNodeMember */
export const STeamMember = SOrgNodeMember;

/** @deprecated Use TOrgNodeDomainModel */
export type TTeamDomainModel = TOrgNodeDomainModel;
/** @deprecated Use SOrgNodeDomainModel */
export const STeamDomainModel = SOrgNodeDomainModel;
/** @deprecated Use TOrgNodeRecord */
export type TTeamRecord = TOrgNodeRecord;

/** @deprecated Use TOrgNodeMemberViewModel */
export type TTeamMemberViewModel = TOrgNodeMemberViewModel;
/** @deprecated Use TOrgNodeViewModel */
export type TTeamViewModel = TOrgNodeViewModel;
/** @deprecated Use TOrgNodeHierarchyViewModel */
export type TTeamHierarchyViewModel = TOrgNodeHierarchyViewModel;

/** @deprecated Use TOrgMembershipEventType */
export type TCastMembershipEventType = TOrgMembershipEventType;
/** @deprecated Use SOrgMembershipEventType */
export const SCastMembershipEventType = SOrgMembershipEventType;
/** @deprecated Use TOrgMembershipEvent */
export type TCastMembershipEvent = TOrgMembershipEvent;
/** @deprecated Use TOrgMembershipEventRecord */
export type TCastMembershipEventRecord = TOrgMembershipEventRecord;


// ─── Re-exports from ids.js ────────────────────────────────
export {
  SCompanyId,              type TCompanyId,
  SOrgNodeId,              type TOrgNodeId,
  SOrgMembershipEventId,   type TOrgMembershipEventId,
  // Backward-compat aliases
  STeamId,                 type TTeamId,
  SCastMembershipEventId,  type TCastMembershipEventId,
} from './ids.js';
