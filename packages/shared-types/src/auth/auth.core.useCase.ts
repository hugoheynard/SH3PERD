import type {TRefreshToken, TRefreshTokenSecureCookie} from "./auth.domain.tokens.js";
import type {TComparePassword, TCreateAuthSession, THashPassword} from "./auth.core.contracts.js";
import type {TCreateUser, TFindUserByEmail, TSaveUser, TUserId} from "../user/index.js";
import type {TRevokeRefreshToken} from "./auth.core.tokens.contracts.js";


/**
 * Login Use Case Types
 */
export type TLoginRequestDTO = { email: string; password: string; }
export type TLoginResponseDTO = { authToken: string; user_id: TUserId; }

export type TLoginUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmail;
    comparePasswordFn: TComparePassword;
    createAuthSessionFn: TCreateAuthSession;
}
export type TLoginUseCase = (input: TLoginRequestDTO) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * Refresh Session Use Case Types
 */
export type TRefreshSessionRequestDTO = { refreshToken: TRefreshToken };
export type TRefreshSessionUseCase = (input: TRefreshSessionRequestDTO) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * Logout Use Case Types
 */
export type TLogoutRequestDTO = { refreshToken: TRefreshToken };
export type TLogoutResult = { revokedToken: TRefreshToken };
export type TLogoutUseCaseDeps = { revokeRefreshTokenFn: TRevokeRefreshToken };
export type TLogoutUseCase = (input: TLogoutRequestDTO) => Promise<TLogoutResult>;


/**
 * Register Use Case Types
 */
export type RegisterRequestDTO = { email: string; password: string; }
export type RegisterResponseDTO = { user_id: TUserId; }
export type TRegisterUserUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmail;
    hashPasswordFn: THashPassword;
    createUserFn: TCreateUser;
    saveUserFn: TSaveUser;
    generateUserIdFn: () => TUserId;
};
export type TRegisterUserUseCase = (input: RegisterRequestDTO) => Promise<RegisterResponseDTO>;


/**
 * Auth Uses Cases
 */
export type TAuthUseCases = {
    login: TLoginUseCase;
    register: TRegisterUserUseCase;
    refresh: TRefreshSessionUseCase;
    logout: TLogoutUseCase;
}
