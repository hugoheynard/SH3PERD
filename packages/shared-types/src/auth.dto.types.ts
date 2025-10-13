import type { TUserCredentialsDomainModel } from './user/user-credentials.js';
import type { TUserId } from './user/user.domain.js';
import type { TRefreshToken } from './auth.domain.js';

/**
 * User credentials data transfer object
 * Used for login and registration
 */
export type TUserCredentialsDTO = { email: string; password: string };

export type TRegisterUserResponseDTO = TUserCredentialsDomainModel;

export type TLoginResponseDTO = { authToken: string; user_id: TUserId };

export type TRefreshSessionRequestDTO = { refreshToken: TRefreshToken };