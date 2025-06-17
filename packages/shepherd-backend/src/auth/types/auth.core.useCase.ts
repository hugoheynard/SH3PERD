import type {TUserId} from "../../user/types/user.domain.types.js";
import type {TFindUserByEmailFn, TSaveUserFn} from "../../user/types/user.core.repo.js";
import type {
    TComparePassword,
    TCreateAuthSessionFn,
    TFindRefreshTokenFn,
    THashPasswordFn
} from "./auth.core.contracts.js";
import type {TRefreshToken, TRefreshTokenSecureCookie} from "./auth.domain.tokens.js";
import type {TRevokeRefreshTokenFn, TVerifyRefreshTokenFn} from "./auth.core.tokens.contracts.js";
import type {TCreateUserFn} from "../../user/types/user.core.contracts.js";


/**
 * Login Use Case Types
 */
export type TLoginRequestDTO = { email: string; password: string; }
export type TLoginResponseDTO = { authToken: string; user_id: TUserId; }

export type TLoginUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmailFn;
    comparePasswordFn: TComparePassword;
    createAuthSessionFn: TCreateAuthSessionFn;
}
export type TLoginUseCase = (input: TLoginRequestDTO) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * Refresh Session Use Case Types
 */
export type TRefreshSessionRequestDTO = { refreshToken: TRefreshToken };
export type TRefreshSessionUseCaseDeps = {
    findRefreshTokenFn: TFindRefreshTokenFn;
    verifyRefreshTokenFn: TVerifyRefreshTokenFn;
    createAuthSessionFn: TCreateAuthSessionFn;
    revokeRefreshTokenFn: TRevokeRefreshTokenFn;
}
export type TRefreshSessionUseCase = (input: TRefreshSessionRequestDTO) => Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie }>;

/**
 * Logout Use Case Types
 */
export type TLogoutRequestDTO = { refreshToken: TRefreshToken };
export type TLogoutResult = boolean;
export type TLogoutUseCaseDeps = { revokeRefreshTokenFn: TRevokeRefreshTokenFn };
export type TLogoutUseCase = (input: TLogoutRequestDTO) => Promise<TLogoutResult>;


/**
 * Register Use Case Types
 */
export type TRegisterResponseDTO = { user_id: TUserId; }
export type TRegisterUserUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmailFn;
    hashPasswordFn: THashPasswordFn;
    createUserFn: TCreateUserFn;
    saveUserFn: TSaveUserFn;
    generateUserIdFn: () => TUserId;
};
export type TRegisterUserUseCase = (input: TUserCredentialsDTO) => Promise<TRegisterResponseDTO>;


/**
 * Auth Uses Cases
 */
export type TAuthUseCases = {
    login: TLoginUseCase;
    register: TRegisterUserUseCase;
    refresh: TRefreshSessionUseCase;
    logout: TLogoutUseCase;
}
