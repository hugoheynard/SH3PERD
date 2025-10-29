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

export const SContractListItemViewModel = z.object({
  id: SContractId,
  company_id: SCompanyId,
  user_id: SUserId,
  company_name: z.string(),
  status: SContractStatusEnum,
  startDate: z.date(),
  endDate: z.date().optional(),

});