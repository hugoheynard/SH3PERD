import { z } from 'zod';
import { SUserId, type TUserId } from './user/user.domain.js';


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
  active: boolean;
};