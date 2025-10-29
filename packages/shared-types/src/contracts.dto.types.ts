import type { TCompanyId } from './company.domain.js';
import type { TUserId } from './user/user.domain.js';
import type { TContractDomainModel } from './contracts.domain.types.js';


export type TCreateContractRequestDTO = {
  company_id: TCompanyId;
  user_id: TUserId;
  status: TContractDomainModel['status'];
  startDate: Date;
  endDate?: Date;
}


export type TGetContractsByFilterRequestDTO = { filter: Partial<TContractDomainModel> };