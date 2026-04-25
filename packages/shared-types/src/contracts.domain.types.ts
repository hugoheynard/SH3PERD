import { z } from "zod";
import type { ZodOutput } from "./utils/zod.types.js";
import type { TRecordMetadata } from "./metadata.types.js";
import {
  SUserId,
  type TUserId,
  SCompanyId,
  type TCompanyId,
  SContractId,
  type TContractId,
  SSignatureId,
  type TSignatureId,
  SAddendumId,
  type TAddendumId,
  SContractDocumentId,
  type TContractDocumentId,
} from "./ids.js";
import { SContractRole, type TContractRole } from "./permissions.types.js";

// ─── Enums ─────────────────────────────────────────────────

export const SContractStatus = z.enum(["draft", "active", "terminated"]);
export type TContractStatus = z.infer<typeof SContractStatus>;

export const SContractType = z.enum([
  "CDI",
  "CDD",
  "freelance",
  "stage",
  "alternance",
]);
export type TContractType = z.infer<typeof SContractType>;

export const SCompensationPeriod = z.enum(["monthly", "daily", "hourly"]);
export type TCompensationPeriod = z.infer<typeof SCompensationPeriod>;

export const SWorkTimeType = z.enum(["full_time", "part_time"]);
export type TWorkTimeType = z.infer<typeof SWorkTimeType>;

// TODO: wire trial period status into TContractDomainModel once business rules are defined
export const STrialStatus = z.enum([
  "pending",
  "accepted",
  "rejected",
  "expired",
]);
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

export const SContractCompensation: ZodOutput<TContractCompensation> = z.object(
  {
    amount: z.number().positive(),
    currency: z.string().min(1),
    period: SCompensationPeriod,
  },
);

/** Work time terms */
export interface TContractWorkTime {
  type: TWorkTimeType;
  /** Percentage of full time, e.g. 80 for 80% — only relevant when type is "part_time" */
  percentage?: number;
}

export const SContractWorkTime: ZodOutput<TContractWorkTime> = z.object({
  type: SWorkTimeType,
  percentage: z.number().min(1).max(99).optional(),
});

// ─── Signature ─────────────────────────────────────────────

/** A signature from one party on a contract */
export interface TContractSignature {
  signature_id: TSignatureId;
  signed_at: Date;
  /** The user who physically performed the signing */
  signed_by: TUserId;
  /** Which side of the contract this signature represents */
  signer_role: "user" | "company";
  /** Snapshot of the signer's contract roles at signing time */
  signed_by_roles: TContractRole[];
  /** The signer's own contract in the company (always set for company-side signers) */
  signed_by_contract_id?: TContractId;
}

export const SContractSignature: ZodOutput<TContractSignature> = z.object({
  signature_id: SSignatureId,
  signed_at: z.date(),
  signed_by: SUserId,
  signer_role: z.enum(["user", "company"]),
  signed_by_roles: z.array(SContractRole),
  signed_by_contract_id: SContractId.optional(),
});

// ─── Contract Document ─────────────────────────────────────

export interface TContractDocument {
  id: TContractDocumentId;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  s3Key: string;
  uploadedAt: Date;
  uploadedBy: TUserId;
  requiresSignature?: boolean;
  /** Dual-sign signatures collected on this document — only populated when requiresSignature is true */
  signatures?: {
    user?: TContractSignature;
    company?: TContractSignature;
  };
}

export const SContractDocument: ZodOutput<TContractDocument> = z.object({
  id: SContractDocumentId,
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  s3Key: z.string().min(1),
  uploadedAt: z.date(),
  uploadedBy: SUserId,
  requiresSignature: z.boolean().optional(),
  signatures: z
    .object({
      user: SContractSignature.optional(),
      company: SContractSignature.optional(),
    })
    .optional(),
});

// ─── Contract ──────────────────────────────────────────────

/** Core contract linking a user (employee/contractor) to a company */
export interface TContractDomainModel {
  id: TContractId;
  /** The employee or contractor */
  user_id: TUserId;
  /** The employing company */
  company_id: TCompanyId;
  /**
   * Roles held by this user within the company.
   * A single contract can carry multiple roles (e.g. `["admin", "artist"]`).
   * This is the single source of truth for "what can this user do in this company".
   */
  roles: TContractRole[];
  status: TContractStatus;
  /** Legal/administrative contract type */
  contract_type?: TContractType;
  /** Job title / role label */
  job_title?: string;
  startDate: Date;
  /** Required for CDD, stage, alternance */
  endDate?: Date;
  /** Trial period duration in calendar days */
  trial_period_days?: number;
  /** Compensation terms */
  compensation?: TContractCompensation;
  /** Work time terms */
  work_time?: TContractWorkTime;
  /** Whether the user has pinned this as their active/default contract */
  is_favorite?: boolean;
  /** Signatures collected from each party */
  signatures?: {
    user?: TContractSignature;
    company?: TContractSignature;
  };
  /** Attached legal documents (PDFs, etc.) */
  documents?: TContractDocument[];
}

export const SContractDomainModel: ZodOutput<TContractDomainModel> = z.object({
  id: SContractId,
  user_id: SUserId,
  company_id: SCompanyId,
  roles: z.array(SContractRole).default([]),
  status: SContractStatus,
  contract_type: SContractType.optional(),
  job_title: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  trial_period_days: z.number().int().positive().optional(),
  compensation: SContractCompensation.optional(),
  work_time: SContractWorkTime.optional(),
  is_favorite: z.boolean().optional(),
  signatures: z
    .object({
      user: SContractSignature.optional(),
      company: SContractSignature.optional(),
    })
    .optional(),
  documents: z.array(SContractDocument).optional(),
});

export type TContractRecord = TContractDomainModel & TRecordMetadata;

// ─── Contract Addendum ─────────────────────────────────────

export const SAddendumTemplate = z.enum([
  "change_remuneration",
  "extend_period",
  "extend_trial",
]);
export type TAddendumTemplate = z.infer<typeof SAddendumTemplate>;

export const SAddendumStatus = z.enum(["draft", "applied", "rejected"]);
export type TAddendumStatus = z.infer<typeof SAddendumStatus>;

/** Discriminated union of changes per template */
export type TAddendumChanges =
  | { template: "change_remuneration"; compensation: TContractCompensation }
  | { template: "extend_period"; endDate: Date }
  | { template: "extend_trial"; trial_period_days: number };

export const SAddendumChanges = z.discriminatedUnion("template", [
  z.object({
    template: z.literal("change_remuneration"),
    compensation: SContractCompensation,
  }),
  z.object({ template: z.literal("extend_period"), endDate: z.date() }),
  z.object({
    template: z.literal("extend_trial"),
    trial_period_days: z.number().int().positive(),
  }),
]);

export interface TContractAddendumDomainModel {
  id: TAddendumId;
  contract_id: TContractId;
  status: TAddendumStatus;
  reason?: string;
  effectiveDate: Date;
  changes: TAddendumChanges;
  signatures?: {
    user?: TContractSignature;
    company?: TContractSignature;
  };
  documents?: TContractDocument[];
  createdAt: Date;
  createdBy: TUserId;
}

export const SContractAddendumDomainModel: ZodOutput<TContractAddendumDomainModel> =
  z.object({
    id: SAddendumId,
    contract_id: SContractId,
    status: SAddendumStatus,
    reason: z.string().optional(),
    effectiveDate: z.date(),
    changes: SAddendumChanges,
    signatures: z
      .object({
        user: SContractSignature.optional(),
        company: SContractSignature.optional(),
      })
      .optional(),
    documents: z.array(SContractDocument).optional(),
    createdAt: z.date(),
    createdBy: SUserId,
  });

export type TContractAddendumRecord = TContractAddendumDomainModel &
  TRecordMetadata;

// ─── Re-export IDs ────────────────────────────────────────
export {
  SContractId,
  type TContractId,
  SSignatureId,
  type TSignatureId,
  SAddendumId,
  type TAddendumId,
  SContractDocumentId,
  type TContractDocumentId,
} from "./ids.js";
