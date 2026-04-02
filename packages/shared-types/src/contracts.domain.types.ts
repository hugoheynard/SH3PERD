import { z } from 'zod';
import type { ZodOutput } from './utils/zod.types.js';
import type { TRecordMetadata } from './metadata.types.js';
import {
  SUserId,      type TUserId,
  SCompanyId,   type TCompanyId,
  SContractId,  type TContractId,
  SSignatureId, type TSignatureId,
  SAddendumId,
} from './ids.js';
import { SContractRole, type TContractRole } from './permissions.types.js';

// ─── Enums ─────────────────────────────────────────────────

export const SContractStatus = z.enum(['draft', 'active', 'terminated']);
export type TContractStatus = z.infer<typeof SContractStatus>;

export const SContractType = z.enum(['CDI', 'CDD', 'freelance', 'stage', 'alternance']);
export type TContractType = z.infer<typeof SContractType>;

export const SCompensationPeriod = z.enum(['monthly', 'daily', 'hourly']);
export type TCompensationPeriod = z.infer<typeof SCompensationPeriod>;

export const SWorkTimeType = z.enum(['full_time', 'part_time']);
export type TWorkTimeType = z.infer<typeof SWorkTimeType>;

// TODO: wire trial period status into TContractDomainModel once business rules are defined
export const STrialStatus = z.enum(['pending', 'accepted', 'rejected', 'expired']);
export type TTrialStatus = z.infer<typeof STrialStatus>;

// ─── Sub-objects ───────────────────────────────────────────

/** Compensation terms */
export interface TContractCompensation {
  /** Gross amount */
  amount: number;
  /** ISO 4217 currency code, e.g. "EUR" */
  currency: string;
  /** Billing / pay period */
  period: TCompensationPeriod;
}

export const SContractCompensation: ZodOutput<TContractCompensation> = z.object({
  amount:   z.number().positive(),
  currency: z.string().min(1),
  period:   SCompensationPeriod,
});

/** Work time terms */
export interface TContractWorkTime {
  type: TWorkTimeType;
  /** Percentage of full time, e.g. 80 for 80% — only relevant when type is "part_time" */
  percentage?: number;
}

export const SContractWorkTime: ZodOutput<TContractWorkTime> = z.object({
  type:       SWorkTimeType,
  percentage: z.number().min(1).max(99).optional(),
});

// ─── Signature ─────────────────────────────────────────────

/** A signature from one party on a contract */
export interface TContractSignature {
  signature_id: TSignatureId;
  signed_at:    Date;
  /** The user who physically performed the signing */
  signed_by:    TUserId;
  /** Which side of the contract this signature represents */
  signer_role:  'user' | 'company';
}

export const SContractSignature: ZodOutput<TContractSignature> = z.object({
  signature_id: SSignatureId,
  signed_at:    z.date(),
  signed_by:    SUserId,
  signer_role:  z.enum(['user', 'company']),
});

// ─── Contract ──────────────────────────────────────────────

/** Core contract linking a user (employee/contractor) to a company */
export interface TContractDomainModel {
  id:           TContractId;
  /** The employee or contractor */
  user_id:      TUserId;
  /** The employing company */
  company_id:   TCompanyId;
  /**
   * Roles held by this user within the company.
   * A single contract can carry multiple roles (e.g. `["admin", "artist"]`).
   * This is the single source of truth for "what can this user do in this company".
   */
  roles:        TContractRole[];
  status:       TContractStatus;
  /** Legal/administrative contract type */
  contract_type?: TContractType;
  /** Job title / role label */
  job_title?:   string;
  startDate:    Date;
  /** Required for CDD, stage, alternance */
  endDate?:     Date;
  /** Trial period duration in calendar days */
  trial_period_days?: number;
  /** Compensation terms */
  compensation?: TContractCompensation;
  /** Work time terms */
  work_time?:   TContractWorkTime;
  /** Whether the user has pinned this as their active/default contract */
  is_favorite?: boolean;
  /** Signatures collected from each party */
  signatures?:  {
    user?:    TContractSignature;
    company?: TContractSignature;
  };
}

export const SContractDomainModel: ZodOutput<TContractDomainModel> = z.object({
  id:                 SContractId,
  user_id:            SUserId,
  company_id:         SCompanyId,
  roles:              z.array(SContractRole).default([]),
  status:             SContractStatus,
  contract_type:      SContractType.optional(),
  job_title:          z.string().optional(),
  startDate:          z.date(),
  endDate:            z.date().optional(),
  trial_period_days:  z.number().int().positive().optional(),
  compensation:       SContractCompensation.optional(),
  work_time:          SContractWorkTime.optional(),
  is_favorite:        z.boolean().optional(),
  signatures: z.object({
    user:    SContractSignature.optional(),
    company: SContractSignature.optional(),
  }).optional(),
});

export type TContractRecord = TContractDomainModel & TRecordMetadata;

// ─── Contract Addendum ─────────────────────────────────────
// TODO: implement addendum feature — model below is a draft skeleton, do not use.
//       Known issues before production use:
//       · `changes` array is untyped — should be a discriminated union of known contract fields
//       · `signatures` should embed TContractSignature objects (not IDs) for consistency with TContractDomainModel
//       · `created_by` should be TUserId (not TCompanyId)
//       · Clarify whether addendum is embedded in the contract document or a separate collection

export const SContractAddendumDomainModel = z.object({
  id:            SAddendumId,
  contract_id:   SContractId,
  reason:        z.string(),
  effectiveDate: z.date(),
  changes: z.array(z.object({
    field:    z.string(),
    oldValue: z.unknown(),
    newValue: z.unknown(),
  })),
  createdAt: z.date(),
  createdBy: SCompanyId,
});
export type TContractAddendumDomainModel = z.infer<typeof SContractAddendumDomainModel>;
export type TContractAddendumRecord = TContractAddendumDomainModel & TRecordMetadata;

// ─── Re-export IDs ────────────────────────────────────────
export {
  SContractId,  type TContractId,
  SSignatureId, type TSignatureId,
  SAddendumId,  type TAddendumId,
} from './ids.js';
