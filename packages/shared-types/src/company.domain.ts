import { z } from 'zod';
import type { TRecordMetadata } from './metadata.types.js';
import { createIdSchema } from './utils/createIdSchema.js';
import { SUserId, type TUserId } from './user/user.domain.js';
import { SContractId, type TContractId } from './contracts.domain.types.js';

// ─── Company ───────────────────────────────────────────────

export const SCompanyId = createIdSchema('company');
export type TCompanyId = `company_${string}`;

export const SServiceId = createIdSchema('service');
export type TServiceId = `service_${string}`;

export const SService = z.object({
  id: SServiceId,
  name: z.string().min(1),
});
export type TService = z.infer<typeof SService>;

export const SCompanyDomainModel = z.object({
  id: SCompanyId,
  name: z.string().min(1),
  services: z.array(SService).default([]),
});
export type TCompanyDomainModel = z.infer<typeof SCompanyDomainModel>;
export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;

// ─── Cast ──────────────────────────────────────────────────

export const SCastId = createIdSchema('cast');
export type TCastId = `cast_${string}`;

export const SCastStatusEnum = z.enum(['active', 'archived']);
export type TCastStatus = z.infer<typeof SCastStatusEnum>;

/**
 * A CastMember records a single membership window.
 * leftAt is absent while the member is still active.
 */
export const SCastMember = z.object({
  user_id: SUserId,
  contract_id: SContractId,
  joinedAt: z.coerce.date(),
  leftAt: z.coerce.date().optional(),
});
export type TCastMember = z.infer<typeof SCastMember>;

export const SCastDomainModel = z.object({
  id: SCastId,
  company_id: SCompanyId,
  name: z.string().min(1),
  service_id: SServiceId.optional(),
  members: z.array(SCastMember).default([]),
  status: SCastStatusEnum.default('active'),
});
export type TCastDomainModel = z.infer<typeof SCastDomainModel>;
export type TCastRecord = TCastDomainModel & TRecordMetadata;

// ─── Cast Membership Events (audit trail) ──────────────────

export const SCastMembershipEventId = createIdSchema('castevt');
export type TCastMembershipEventId = `castevt_${string}`;

export const SCastMembershipEventType = z.enum(['member_added', 'member_removed']);
export type TCastMembershipEventType = z.infer<typeof SCastMembershipEventType>;

export const SCastMembershipEvent = z.object({
  id: SCastMembershipEventId,
  cast_id: SCastId,
  user_id: SUserId,
  type: SCastMembershipEventType,
  date: z.coerce.date(),
  by: SUserId,
  reason: z.string().optional(),
});
export type TCastMembershipEvent = z.infer<typeof SCastMembershipEvent>;
export type TCastMembershipEventRecord = TCastMembershipEvent & TRecordMetadata;

// ─── View models ───────────────────────────────────────────

export type TCastMemberViewModel = {
  user_id: TUserId;
  contract_id: TContractId;
  joinedAt: Date;
  leftAt?: Date;
};

export type TCastViewModel = {
  id: TCastId;
  company_id: TCompanyId;
  name: string;
  service_id?: TServiceId;
  status: TCastStatus;
  activeMembers: TCastMemberViewModel[];
};

export type TCompanyViewModel = {
  id: TCompanyId;
  name: string;
  services: TService[];
};
