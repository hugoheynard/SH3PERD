import {
  SContractId,
  SContractStatus,
  type TContractId,
  type TContractStatus,
  type TContractSignature,
  type TContractType,
  type TContractCompensation,
  type TContractWorkTime,
  type TContractDocument,
  type TContractAddendumDomainModel,
} from "./contracts.domain.types.js";
import { z } from "zod";
import { SCompanyId, type TCompanyId } from "./ids.js";
import { SUserId, type TUserId } from "./user/user.domain.js";
import { SContractRole, type TContractRole } from "./permissions.types.js";

/** Contract as seen from the user side — includes company name */
export type TContractListItemViewModel = {
  id: TContractId;
  user_id: TUserId;
  company_id: TCompanyId;
  company_name: string;
  roles: TContractRole[];
  contract_type?: TContractType;
  job_title?: string;
  startDate: Date;
  endDate?: Date;
  status: TContractStatus;
};

/** Contract as seen from the company side — includes user identity */
export type TCompanyContractViewModel = {
  id: TContractId;
  user_id: TUserId;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  roles: TContractRole[];
  contract_type?: TContractType;
  job_title?: string;
  status: TContractStatus;
  startDate: Date;
  endDate?: Date;
};

/** Full contract detail used by the contract detail page */
export type TContractDetailViewModel = {
  id: TContractId;
  user_id: TUserId;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  company_id: TCompanyId;
  roles: TContractRole[];
  status: TContractStatus;
  contract_type?: TContractType;
  job_title?: string;
  startDate: Date;
  endDate?: Date;
  trial_period_days?: number;
  compensation?: TContractCompensation;
  work_time?: TContractWorkTime;
  signatures?: {
    user?: TContractSignature;
    company?: TContractSignature;
  };
  documents?: TContractDocument[];
  addenda?: TContractAddendumDomainModel[];
};

export const SContractListItemViewModel = z.object({
  id: SContractId,
  company_id: SCompanyId,
  user_id: SUserId,
  company_name: z.string(),
  roles: z.array(SContractRole),
  status: SContractStatus,
  startDate: z.date(),
  endDate: z.date().optional(),
});
