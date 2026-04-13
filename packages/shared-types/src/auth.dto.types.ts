import { SuserCredentialsDTO, type TUserCredentialsDomainModel } from './user/user-credentials.js';
import type { TUserId } from './user/user.domain.js';
import type { TRefreshToken } from './auth.domain.js';
import { z } from 'zod';
import { zConstrainedString } from './utils/zConstrainedString.js';

/**
 * User credentials data transfer object
 * Used for login and registration
 */
export type TUserCredentials = { email: string; password: string };

export type TRegisterUserRequestDTO = TUserCredentials & { first_name: string; last_name: string };

export const SRegisterUserRequestDTO = z
  .object({
    first_name: zConstrainedString('First name', { minLength: 3 }),
    last_name: zConstrainedString('Last name', { minLength: 3 }),
  })
  .merge(SuserCredentialsDTO);

export type TRegisterUserResponseDTO = TUserCredentialsDomainModel;

export type TLoginRequestDTO = TUserCredentials;
export type TLoginResponseDTO = { authToken: string; user_id: TUserId };

export type TRefreshSessionRequestDTO = { refreshToken: TRefreshToken };

export type TChangePasswordRequestDTO = { currentPassword: string; newPassword: string };

export const SChangePasswordRequestDTO = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
});