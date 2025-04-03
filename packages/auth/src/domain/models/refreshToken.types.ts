import type {UserId} from "@sh3pherd/user";

export type TRefreshToken = `refreshToken_${string}`;

export type TRefreshTokenRecord = {
    refreshToken: TRefreshToken;
    user_id: UserId;
    expiresAt: Date;
    createdAt: Date;
}

export type TRevokeRefreshTokenResult = { revokedToken: TRefreshToken };

export type TGenerateRefreshTokenFunction = (input: { user_id: UserId }) => Promise<TRefreshToken>;
export type TVerifyRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<boolean>;
export type TRevokeRefreshToken = (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;

export interface IRefreshTokenRepository {
    saveRefreshToken: (input: { refreshTokenRecord: TRefreshTokenRecord }) => Promise<{ success: boolean }>;
    findRefreshToken: (input: { refreshToken: TRefreshToken }) => Promise<TRefreshTokenRecord | null>;
    revokeRefreshToken: (input: { refreshToken: TRefreshToken }) => Promise<TRevokeRefreshTokenResult>;
}

export type TRefreshTokenManagerInput = {
    generatorFunction: () => Promise<TRefreshToken>;
    validateRefreshTokenFunction: (input: { refreshToken: TRefreshToken }) => Promise<boolean>;
    refreshTokenRepository: IRefreshTokenRepository;
    ttlMs: number;
};

export interface IRefreshTokenManager {
    generateRefreshToken: TGenerateRefreshTokenFunction;
    verifyRefreshToken: TVerifyRefreshToken;
    revokeRefreshToken: TRevokeRefreshToken;
}