import type { TRecordMetadata } from '../metadata.types.js';
import { z } from 'zod';
import { SUserId, type TUserId } from './user.domain.js';


export const SUserCredentialsDomainModel = z.object({
  id: SUserId,
  email: z.string().email(),
  password: z.string(),
  active: z.boolean(),
  email_verified: z.boolean(),
});
export type TUserCredentialsDomainModel = {
  id: TUserId;
  email: string;
  password: string;
  active: boolean;
  email_verified: boolean;
};
export type TUserCredentialsRecord = TUserCredentialsDomainModel & TRecordMetadata;