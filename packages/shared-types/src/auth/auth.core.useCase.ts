import type {TRefreshToken} from "./auth.domain.tokens.js";
import type {TComparePassword, TCreateAuthSession, THashPassword} from "./auth.core.contracts.js";
import type {TCreateUser, TFindUserByEmail, TSaveUser, TUserId} from "../user/index.js";

/**
 * Login Use Case Types
 */
export type TLoginRequestDTO = {
    email: string;
    password: string;
}

export type TLoginResponseDTO = {
    authToken: string;
    refreshToken: TRefreshToken;
    user_id: TUserId;
}

export type TLoginUseCase = (input: TLoginRequestDTO) => Promise<TLoginResponseDTO>;


export type TLoginUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmail;
    comparePasswordFn: TComparePassword;
    createAuthSessionFn: TCreateAuthSession;
}

export type TLoginUseCaseFactory = (deps: TLoginUseCaseDeps) => TLoginUseCase;




/**
 * Register Use Case Types
 */
export type RegisterRequestDTO = {
    email: string;
    password: string;
}

export type RegisterResponseDTO = {
    email: string;
    password: string;
}

export type TRegisterUserUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmail;
    hashPasswordFn: THashPassword;
    createUserFn: TCreateUser;
    saveUserFn: TSaveUser;
    generateUserIdFn: () => TUserId;
};

export type TRegisterUserUseCase = (input: RegisterRequestDTO) => Promise<RegisterResponseDTO>;

export type TRegisterUserUseCaseFactory = (deps: TRegisterUserUseCaseDeps) => TRegisterUserUseCase;