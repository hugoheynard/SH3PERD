import { z } from 'zod';
import type { TRecordMetadata } from '../metadata.types.js';
import { SUserId, type TUserId } from './user.domain.js';
import { createIdSchema } from '../utils/createIdSchema.js';

export const SUserProfileId = createIdSchema('userProfile');

export type TUserProfileId = `userProfile_${string}`

export const SUserProfileDomainModel = z.object({
  id: SUserProfileId,
  user_id: SUserId,
  first_name: z.string({ message: 'first_name should be a string' }),
  last_name: z.string(),
  display_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  active: z.boolean(),
});


export type TUserProfileDomainModel = {
  id: TUserProfileId;
  user_id: TUserId;
  first_name: string;
  last_name: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  active: boolean;
};

export type TUserProfileRecord = TUserProfileDomainModel & TRecordMetadata;