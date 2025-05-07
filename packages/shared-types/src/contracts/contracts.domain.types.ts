import type {TUserId} from "../user/index.js";

export type TContractId = `contract_${string}`;

export type TContractDomainModel = {
    contract_id: TContractId;
    user_id: TUserId;
    company_id: string;
    status: 'active' | 'terminated';
    favorite: boolean; // will allow to connect straight to the contract, only one per user
    trialPeriod: boolean;
    trialPeriodDuration: number; // in days
    startDate: Date;
    endDate: Date;
    signed: boolean;
    createdAt: Date;
    lastModifiedAt: Date;
    createdBy: TUserId;
}