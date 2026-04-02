import type { TCompanyId }    from './company.domain.js';
import type { TUserId }       from './user/user.domain.js';
import type {
  TContractDomainModel,
  TContractStatus,
  TContractType,
  TContractCompensation,
  TContractWorkTime,
} from './contracts.domain.types.js';
import type { TContractId }   from './ids.js';
import type { TContractRole } from './permissions.types.js';

export type TCreateContractRequestDTO = {
  company_id:    TCompanyId;
  user_id:       TUserId;
  roles?:        TContractRole[];
  status:        TContractDomainModel['status'];
  contract_type?: TContractType;
  job_title?:    string;
  startDate:     Date;
  endDate?:      Date;
};

export type TUpdateContractDTO = {
  contract_id:        TContractId;
  roles?:             TContractRole[];
  status?:            TContractStatus;
  contract_type?:     TContractType;
  job_title?:         string;
  startDate?:         Date;
  /** Pass null to remove the end date */
  endDate?:           Date | null;
  trial_period_days?: number | null;
  compensation?:      TContractCompensation | null;
  work_time?:         TContractWorkTime | null;
};

export type TGetContractsByFilterRequestDTO = { filter: Partial<TContractDomainModel> };
