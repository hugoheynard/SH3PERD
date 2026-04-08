import type { TRecordMetadata } from '../metadata.types.js';
import { z } from 'zod';
import { SUserId, type TUserId } from './user.domain.js';


export const SUserCredentialsDomainModel = z.object({
  id: SUserId,
  email: z.string().email(),
  password: z.string().nullable(),
  active: z.boolean(),
  email_verified: z.boolean(),
  /** True for guest users who haven't activated their account yet. */
  is_guest: z.boolean().default(false),
});

/**
 * Validates login credentials with strong constraints:
 * - Email must exist and be valid
 * - Password must be a non-empty string, at least 8 characters, without spaces
 */
export const SuserCredentialsDTO = z.object({
  email: z
    .string({ required_error: 'Email is required and must be a string.' })
    .trim()
    .min(1, 'Email is required and must be a string.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format.'),

  password: z
    .string({ required_error: 'Password is required and must be a string.' })
    .min(8, 'Password should be at least 8 characters long.')
    .refine((pwd) => !pwd.includes(' '), {
      message: 'Password should not contain spaces.',
    }),
});


export type TUserCredentialsDomainModel = {
  id: TUserId;
  email: string;
  password: string | null;
  active: boolean;
  email_verified: boolean;
  /** True for guest users who haven't activated their account yet. */
  is_guest: boolean;
};
export type TUserCredentialsRecord = TUserCredentialsDomainModel & TRecordMetadata;