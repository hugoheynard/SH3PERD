import type {TUserId_shared} from "@sh3pherd/shared-types";
import type {TRefreshToken, TRefreshTokenDomainModel} from "./models/refreshToken.types";
import type {TAuthTokenPayload} from "./models/authToken.types";
import type {TRevokeRefreshTokenResult} from "./models/authResults.types";


//AuthTokenManager Functions
export type TGenerateAuthToken = (input: { payload: TAuthTokenPayload }) => Promise<string>;
export type TVerifyAuthToken = (input: { token: string }) => Promise<TAuthTokenPayload>;

//RefreshTokenManager Functions
export type TGenerateRefreshToken = (input: { user_id: TUserId_shared }) => Promise<TRefreshToken>;
export type TVerifyRefreshToken = (input: { refreshTokenRecord: TRefreshTokenDomainModel }) => boolean;
export type TRevokeRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;

//RefreshTokenRepository Functions
export type TSaveRefreshToken = (input: { refreshTokenDomainModel: TRefreshTokenDomainModel }) => Promise<{ success: boolean }>;
export type TFindRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRefreshTokenDomainModel | null>;
export type TDeleteRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;

//AuthTokenService Functions
export type TCreateAuthSession = (input: { user_id: TUserId_shared }) => Promise<{ authToken: string; refreshToken: TRefreshToken}>