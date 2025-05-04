
import type {TUserId} from "../user/index.js";
import type {
    TAuthTokenPayload,
    TCreateAuthSessionResult,
    TRefreshToken,
    TRefreshTokenDomainModel, TRefreshTokenSecureCookie,
    TRevokeRefreshTokenResult
} from "./auth.domain.tokens.js";

//Password
export type TComparePasswordResult = {
    isValid: boolean;
    wasRehashed: boolean;
    newHash?: string;
}

export type THashPassword = (input: { password: string }) => Promise<string>;
export type TComparePassword = (input: { password: string; hashedPassword: string }) => Promise<TComparePasswordResult>;

//AuthTokenManager Functions
export type TGenerateAuthToken = (input: { payload: TAuthTokenPayload }) => Promise<string>;
export type TVerifyAuthToken = (input: { authToken: string }) => Promise<TAuthTokenPayload | null>;


//RefreshTokenRepository Functions
export type TSaveRefreshToken = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel }) => Promise<boolean>;
export type TFindRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRefreshTokenDomainModel | null>;
export type TDeleteRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;
export type TDeleteAllRefreshTokensForUser = (input: { user_id: TUserId }) => Promise<boolean>;


//AuthTokenService Functions


export type TCreateAuthSession = (input: { user_id: TUserId }) => Promise<TCreateAuthSessionResult>

export type TRefreshAuthSession = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel }) => Promise<TCreateAuthSessionResult>;

export type TGenerateRefreshTokenCookie = (input: {
    refreshToken: TRefreshToken;
    customPath?: string;
})=> TRefreshTokenSecureCookie;


export type TFindAndVerifyRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<{  isValid: boolean, user_id: TUserId | null }>;

