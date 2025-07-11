import { z } from 'zod';
import { SUserId } from './user.domain.js';


export const SRecordMetadata = z.object({
  created_at: z.date(),
  updated_at: z.date(),
  created_by: SUserId,
  active: z.boolean().default(true),
});


export type TRecordMetadata = z.infer<typeof SRecordMetadata>;