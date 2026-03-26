import {
  SContractId,
  SContractStatusEnum,
  type TContractId,
  type TContractStatusEnum,
} from './contracts.domain.types.js';
import { z } from 'zod';
import { SCompanyId, type TCompanyId } from './company.domain.js';
import { SUserId, type TUserId } from './user/user.domain.js';


export type TContractListItemViewModel = {
  id: TContractId;
  user_id: TUserId;
  company_id: TCompanyId,
  company_name: string;
  startDate: Date;
  endDate?: Date;
  status: TContractStatusEnum;
}

/**
 * Contract as seen from the company side — includes user identity instead of company name.
 */
export type TCompanyContractViewModel = {
  id:              TContractId;
  user_id:         TUserId;
  user_first_name?: string;
  user_last_name?:  string;
  user_email?:      string;
  status:          TContractStatusEnum;
  startDate:       Date;
  endDate?:        Date;
};

export const SContractListItemViewModel = z.object({
  id: SContractId,
  company_id: SCompanyId,
  user_id: SUserId,
  company_name: z.string(),
  status: SContractStatusEnum,
  startDate: z.date(),
  endDate: z.date().optional(),

});