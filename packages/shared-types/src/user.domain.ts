import { z } from 'zod';
import type { TRecordMetadata } from './metadata.types.js';

export type TUserId = z.infer<typeof SUserId>;

export const SUserId = z.string().regex(
  /^user_[a-zA-Z0-9_-]+$/,
  { message: 'Invalid user_id format' }
);

// CREDENTIALS
export const SUserCredentialsDomainModel = z.object({
  user_id: SUserId,
  email: z.string().email(),
  password: z.string(),
  active: z.boolean(),
  email_verified: z.boolean()
});

export type TUserCredentialsDomainModel = z.infer<typeof SUserCredentialsDomainModel>;
export type TUserCredentialsRecord = TUserCredentialsDomainModel & TRecordMetadata;


//PROFILE
export const SUserProfileDomainModel = z.object({
  first_name: z.string(),
  last_name: z.string(),
  display_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional()
});

export type TUserProfileDomainModel = z.infer<typeof SUserProfileDomainModel>;
export type TUserProfileRecord = TUserProfileDomainModel & TRecordMetadata;


export type TUser =
  TUserId
  & TUserProfileDomainModel
