import type {TUserId} from "../../user/types/user.domain.types.js";

export type TContractId = `contract_${string}`;
export type TContractAddendumId = `contractAddendum_${string}`;
export type TAddendumId = `addendum_${string}`;
export type TContractSignatureId = `contractSignature_${string}`;
export type TCompanyId = `company_${string}`;

export type TContractDomainModel = {
    contract_id: TContractId;
    user_id: TUserId;
    company_id: string;
    status: 'active' | 'terminated';
    favorite: boolean; // will allow to connect straight to the contract, only one per user
    trial?: {
        endDate: Date;
        status: 'pending' | 'accepted' | 'rejected' | 'expired';
        validatedAt?: Date;
        rejectedAt?: Date;
    };
    startDate: Date;
    endDate: Date;
    signedBy?: {
        user: TContractSignature;
        company: TContractSignature;
    };
    addenda?: TContractAddendumDomainModel[];
    createdAt: Date;
    lastModifiedAt: Date;
    createdBy: TCompanyId;
};


//TODO LATER
export type TContractAddendumDomainModel = {
    addendum_id: TAddendumId;
    contract_id: TContractId;
    reason: string;
    effectiveDate: Date;
    changes: {
        field: keyof TContractDomainModel;
        oldValue: unknown;
        newValue: unknown;
    }[];
    signedBy: {
        user: TContractSignatureId;
        company: TContractSignatureId;
    };
    createdAt: Date;
    createdBy: TCompanyId;
};

export type TSignedItem =
    | { type: 'contract'; id: TContractId }
    | { type: 'addendum'; id: TContractAddendumId };

export type TContractSignature = {
    signatureId: string;
    signedItem: TSignedItem;
    signerType: 'user' | 'company';
    signerId: TUserId | TCompanyId;
    signedAt: Date;
    signedBy: TUserId;
};