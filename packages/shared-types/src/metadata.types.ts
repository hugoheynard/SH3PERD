import { z } from 'zod';
import { SUserId, type TUserId } from './user/user.domain.js';
import type { TContractId } from './contracts.domain.types.js';


export const SRecordMetadata = z.object({
  created_at: z.date(),
  updated_at: z.date(),
  created_by: SUserId,
  active: z.boolean().default(true),
});


export type TRecordMetadata = {
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
  creation_context?: TContractId
  active: boolean;
};