import type {
  TCompanyId,
  TContractDocument,
  TContractDocumentId,
  TContractDomainModel,
  TContractId,
  TContractRole,
  TContractSignature,
  TContractStatus,
  TSignatureId,
  TUserId,
} from '@sh3pherd/shared-types';
import { ContractEntity } from '../ContractEntity.js';

export const userId = (n = 1) => `user_test-${n}` as TUserId;
export const companyId = (n = 1) => `company_test-${n}` as TCompanyId;
export const contractId = (n = 1) => `contract_test-${n}` as TContractId;
export const documentId = (n = 1) => `contractDoc_test-${n}` as TContractDocumentId;

export function makeSignature(
  side: 'user' | 'company',
  overrides: Partial<TContractSignature> = {},
): TContractSignature {
  return {
    signature_id: `signature_test-${side}` as TSignatureId,
    signed_at: new Date('2026-01-01T00:00:00Z'),
    signed_by: userId(),
    signer_role: side,
    signed_by_roles: side === 'company' ? ['owner'] : ['artist'],
    ...overrides,
  };
}

type MakeContractOverrides = {
  id?: TContractId;
  user_id?: TUserId;
  company_id?: TCompanyId;
  roles?: TContractRole[];
  status?: TContractStatus;
  startDate?: Date;
  endDate?: Date;
  signatures?: {
    user?: TContractSignature;
    company?: TContractSignature;
  };
  documents?: TContractDocument[];
};

export function makeContract(overrides: MakeContractOverrides = {}): ContractEntity {
  const props: TContractDomainModel = {
    id: overrides.id ?? contractId(),
    user_id: overrides.user_id ?? userId(),
    company_id: overrides.company_id ?? companyId(),
    roles: overrides.roles ?? ['artist'],
    status: overrides.status ?? 'draft',
    startDate: overrides.startDate ?? new Date('2026-01-01T00:00:00Z'),
    endDate: overrides.endDate,
    signatures: overrides.signatures,
    documents: overrides.documents,
  };
  return new ContractEntity(props);
}

export function makeDocument(overrides: Partial<TContractDocument> = {}): TContractDocument {
  return {
    id: overrides.id ?? documentId(),
    fileName: overrides.fileName ?? 'contract.pdf',
    mimeType: overrides.mimeType ?? 'application/pdf',
    sizeBytes: overrides.sizeBytes ?? 1024,
    s3Key: overrides.s3Key ?? 'contracts/test/contract.pdf',
    uploadedAt: overrides.uploadedAt ?? new Date('2026-01-01T00:00:00Z'),
    uploadedBy: overrides.uploadedBy ?? userId(),
    requiresSignature: overrides.requiresSignature,
    signatures: overrides.signatures,
  };
}
