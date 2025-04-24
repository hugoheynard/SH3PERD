import type {
    TAuthTokenPayload,
    TRefreshToken,
    TRefreshTokenDomainModel,
    TRevokeRefreshTokenResult
} from "./auth.domain.tokens.js";
import type {TUserId} from "../user.js";

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
export type TVerifyAuthToken = (input: { token: string }) => Promise<TAuthTokenPayload>;


//RefreshTokenRepository Functions
export type TSaveRefreshToken = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel }) => Promise<{ success: boolean }>;
export type TFindRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRefreshTokenDomainModel | null>;
export type TDeleteRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;

export type TCreateAuthSession = (input: { user_id: TUserId }) => Promise<{
    authToken: string;
    refreshToken: TRefreshToken
}>




