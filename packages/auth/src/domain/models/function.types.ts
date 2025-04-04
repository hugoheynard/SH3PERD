import type {TRefreshToken, TRefreshTokenRecord} from "./refreshToken.types";
import type {TAuthTokenPayload} from "./authToken.types";
import type {UserId} from "@sh3pherd/user";
import type {TRevokeRefreshTokenResult} from "./authResults.types";


//PasswordManager Functions
export type THashPasswordFunction = (input: { password: string }) => Promise<string>;
export type TComparePasswordFunction = (input: { password: string; hashedPassword: string }) => Promise<boolean>;

//AuthTokenManager Functions
export type TGenerateAuthTokenFunction = (input: { payload: TAuthTokenPayload }) => Promise<string>;
export type TVerifyAuthTokenFunction = (input: { token: string }) => Promise<TAuthTokenPayload>;

//RefreshTokenManager Functions
export type TGenerateRefreshTokenFunction = (input: { user_id: UserId }) => Promise<TRefreshToken>;
export type TVerifyRefreshTokenFunction = (input: { refreshTokenRecord: TRefreshTokenRecord }) => boolean;
export type TRevokeRefreshTokenFunction = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;



//AuthTokenService Functions
export type TCreateAuthSessionFunction = (input: { user_id: UserId }) => Promise<{ authToken: string; refreshToken: TRefreshToken}>