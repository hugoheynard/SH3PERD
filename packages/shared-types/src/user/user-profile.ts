import { z } from 'zod';
import type { TRecordMetadata } from '../metadata.types.js';
import type { TUserId } from './user.domain.js';


export const SUserProfileDomainModel = z.object({
  first_name: z.string(),
  last_name: z.string(),
  display_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export type TUserProfileDomainModel = {
  user_id: TUserId;
  first_name: string;
  last_name: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
};

export type TUserProfileRecord = TUserProfileDomainModel & TRecordMetadata;