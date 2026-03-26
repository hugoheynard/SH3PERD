import { z } from 'zod';
import type { TRecordMetadata } from './metadata.types.js';
import {
  SUserId, type TUserId,
  SCompanyId, type TCompanyId,
  SServiceId, type TServiceId,
  SContractId, type TContractId,
  STeamId, type TTeamId,
  SCastMembershipEventId,
} from './ids.js';

// ─── Company Staff ─────────────────────────────────────────

export const SCompanyAdminRole = z.enum(['admin', 'viewer']);
export type TCompanyAdminRole = z.infer<typeof SCompanyAdminRole>;

export const SCompanyAdmin = z.object({
  user_id: SUserId,
  role: SCompanyAdminRole,
  joinedAt: z.coerce.date(),
});
export type TCompanyAdmin = z.infer<typeof SCompanyAdmin>;

// ─── Company Status ────────────────────────────────────────

export const SCompanyStatus = z.enum(['pending', 'active', 'suspended']);
export type TCompanyStatus = z.infer<typeof SCompanyStatus>;

// ─── Service ───────────────────────────────────────────────

export const SService = z.object({
  id: SServiceId,
  name: z.string().min(1),
  color: z.string().optional(),
});
export type TService = z.infer<typeof SService>;

// ─── Company Address ───────────────────────────────────────

export const SCompanyAddress = z.object({
  street:  z.string().optional(),
  city:    z.string().optional(),
  zip:     z.string().optional(),
  country: z.string().optional(),
});
export type TCompanyAddress = z.infer<typeof SCompanyAddress>;

// ─── Company Domain Model ──────────────────────────────────

export const SCompanyDomainModel = z.object({
  id:          SCompanyId,
  name:        z.string().min(1),
  owner_id:    SUserId,
  description: z.string().optional(),
  address:     SCompanyAddress.optional(),
  services:    z.array(SService).default([]),
  admins:      z.array(SCompanyAdmin).default([]),
  status:      SCompanyStatus.default('active'),
});
export type TCompanyDomainModel = z.infer<typeof SCompanyDomainModel>;
export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;

// ─── Cast ──────────────────────────────────────────────────

export const STeamStatusEnum = z.enum(['active', 'archived']);
export type TTeamStatus = z.infer<typeof STeamStatusEnum>;

/**
 * A TeamMember records a single membership window.
 * leftAt is absent while the member is still active.
 */
export const STeamMember = z.object({
  user_id: SUserId,
  contract_id: SContractId,
  joinedAt: z.coerce.date(),
  leftAt: z.coerce.date().optional(),
});
export type TTeamMember = z.infer<typeof STeamMember>;

export const STeamDomainModel = z.object({
  id: STeamId,
  company_id: SCompanyId,
  name: z.string().min(1),
  service_id: SServiceId.optional(),
  members: z.array(STeamMember).default([]),
  status: STeamStatusEnum.default('active'),
});
export type TTeamDomainModel = z.infer<typeof STeamDomainModel>;
export type TTeamRecord = TTeamDomainModel & TRecordMetadata;

// ─── Cast Membership Events (audit trail) ──────────────────

export const SCastMembershipEventType = z.enum(['member_added', 'member_removed']);
export type TCastMembershipEventType = z.infer<typeof SCastMembershipEventType>;

export const SCastMembershipEvent = z.object({
  id: SCastMembershipEventId,
  cast_id: STeamId,
  user_id: SUserId,
  type: SCastMembershipEventType,
  date: z.coerce.date(),
  by: SUserId,
  reason: z.string().optional(),
});
export type TCastMembershipEvent = z.infer<typeof SCastMembershipEvent>;
export type TCastMembershipEventRecord = TCastMembershipEvent & TRecordMetadata;

// ─── View models ───────────────────────────────────────────

export type TTeamMemberViewModel = {
  user_id: TUserId;
  contract_id: TContractId;
  joinedAt: Date;
  leftAt?: Date;
};

export type TTeamViewModel = {
  id: TTeamId;
  company_id: TCompanyId;
  name: string;
  service_id?: TServiceId;
  status: TTeamStatus;
  activeMembers: TTeamMemberViewModel[];
};

export type TCompanyViewModel = {
  id: TCompanyId;
  name: string;
  services: TService[];
};

export type TCompanyDetailViewModel = {
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
};

export type TCompanyCardViewModel = {
  id: TCompanyId;
  name: string;
  status: TCompanyStatus;
  adminCount: number;
  createdAt: Date;
};

// ─── Service Detail View Model ─────────────────────────────

export type TServiceMemberViewModel = {
  user_id: TUserId;
  first_name?: string;
  last_name?: string;
  contract_id: TContractId;
  joinedAt: Date;
};

export type TServiceTeamViewModel = {
  id: TTeamId;
  name: string;
  status: TTeamStatus;
  members: TServiceMemberViewModel[];
};

export type TServiceDetailViewModel = {
  service_id: TServiceId;
  name: string;
  color?: string;
  teams: TServiceTeamViewModel[];
};

// ─── Re-export IDs for consumers of this domain ───────────
export { SCompanyId, type TCompanyId, SServiceId, type TServiceId, STeamId, type TTeamId, SCastMembershipEventId, type TCastMembershipEventId } from './ids.js';
