import { z } from 'zod';
import { SUserId, type TUserId } from './user/user.domain.js';
import { SCompanyId, type TCompanyId } from './company.domain.js';
import type { TRecordMetadata } from './metadata.types.js';


// -------------------------
// Contract & Signature IDs
// -------------------------
export const SContractId = z.custom<`contract_${string}`>(
  (val): val is `contract_${string}` =>
    typeof val === "string" && val.startsWith("contract_"), { message: 'Invalid contract format. Expected format: contract_<unique_identifier>' }
);
export type TContractId = `contract_${string}`| z.infer<typeof SContractId>;

export const SContractSignatureId = z.string().regex(/^contractSignature_[a-zA-Z0-9_-]+$/, { message: 'Invalid contractSignature_id format' });

export const SSignatureId = z.string().regex(/^signature_[a-zA-Z0-9_-]+$/, { message: 'Invalid signature_id format' });
export type TSignatureId = `signature_${string}` | z.infer<typeof SSignatureId>;

export const SAddendumId = z.string().regex(/^addendum_[a-zA-Z0-9_-]+$/, { message: 'Invalid addendum_id format' });
export type TAddendumId = `addendum_${string}` | z.infer<typeof SAddendumId>;

// -------------------------
// Enums
// -------------------------
export const STrialStatusEnum = z.enum(['pending', 'accepted', 'rejected', 'expired']);
export const SContractStatusEnum = z.enum(['draft', 'active', 'terminated']);
export type TContractStatusEnum = 'draft' | 'active' | 'terminated';
export const SSignerTypeEnum = z.enum(['user', 'company']);


// -------------------------
// Signatures
// -------------------------
export const SSignedItem = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('contract'),
    item_id: SContractId
  }),
  z.object({
    type: z.literal('addendum'),
    item_id: SAddendumId
  })
]);

export type TSignedItem = {  type: 'contract', item_id: TContractId } | { type: 'addendum', item_id: TAddendumId };


export const SSignerEntity = z.discriminatedUnion('signerType', [
  z.object({
    signerType: z.literal('user'),
    signer_id: SUserId
  }),
  z.object({
    signerType: z.literal('company'),
    signer_id: SCompanyId
  })
]);

export type TSignerEntity = { signerType: 'user', signer_id: TUserId } | { signerType: 'company', signer_id: TCompanyId };

export const SContractSignatureDomainModel = z.object({
  signature_id: SSignatureId,
  // contract or addendum
  signedItem: SSignedItem,

  // employee user or company
  signerType: SSignerEntity,

  // the core data of the signature is a user (HR/legal rep for company or employee user)
  signedAt: z.date(),
  signedBy: SUserId
});

export type TContractSignatureDomainModel = z.infer<typeof SContractSignatureDomainModel>;
export type TContractSignatureRecord = TContractSignatureDomainModel & TRecordMetadata;


// -------------------------
// Contract
// -------------------------
export const SContractDomainModel = z.object({
  contract_id: SContractId,
  user_id: SUserId,
  company_id: SCompanyId,
  status: SContractStatusEnum,
  startDate: z.date(),
  endDate: z.date().optional(),
  /*
  trial: z.object({
    endDate: z.date(),
    status: STrialStatusEnum,
    validatedAt: z.date(),
    rejectedAt: z.date(),
  }).optional(),
   */

  //signedBy: z.object({
    //user: SContractSignature,
    //company: SContractSignature,
  //}).optional(),
  //addenda?: TContractAddendumDomainModel[]
});

/**
 * TContractDomainModel represents the structure of a contract in the system.
 * It represents an agreement between a user and a company, including details about
 * the contract's status, trial period, and important dates.
 */
export type TContractDomainModel = {
  contract_id: TContractId;
  user_id: TUserId;
  company_id: TCompanyId;
  status: TContractStatusEnum;
  startDate: Date;
  endDate?: Date;

  signedBy?: {
    user?: TContractSignatureDomainModel;
    company?: TContractSignatureDomainModel;

  };
  /*
  trial?: {
    endDate: Date;
    status: z.infer<typeof STrialStatusEnum>;
    validatedAt?: Date;
    rejectedAt?: Date;
  };

   */

  //addenda?: TContractAddendumDomainModel[];
  //ressourceStatus: boolean; //Enum active / deleted / archived
};
export type TContractRecord = TContractDomainModel & TRecordMetadata;

// -------------------------
// Contract Addendum //DONT USE NOW
// -------------------------
export const SContractAddendumDomainModel = z.object({
  addendum_id: SAddendumId,
  contract_id: SContractId,
  reason: z.string(),
  effectiveDate: z.date(),
  changes: z.array(
    z.object({
      field: z.string(),
      oldValue: z.unknown(),
      newValue: z.unknown()
    })
  ),
  signedBy: z.object({
    user: SContractSignatureId,
    company: SContractSignatureId
  }),
  createdAt: z.date(),
  createdBy: SCompanyId
});

export type TContractAddendumDomainModel = z.infer<typeof SContractAddendumDomainModel>;
export type TContractAddendumRecord = TContractAddendumDomainModel & TRecordMetadata;