import type {TRefreshToken} from "./refreshToken.types";
import type {TCheckExpirationDateFunction} from "@sh3pherd/token-manager";
import type {
    TGenerateRefreshTokenFunction,
    TRevokeRefreshTokenFunction,
    TVerifyRefreshTokenFunction
} from "./function.types";
import type {IRefreshTokenRepository} from "./IRefreshTokenRepository";

export interface IAbstractRefreshTokenManager {
    generateRefreshToken: TGenerateRefreshTokenFunction;
    verifyRefreshToken: TVerifyRefreshTokenFunction;
    revokeRefreshToken: TRevokeRefreshTokenFunction;
}

export type TRefreshTokenManagerInput = {
    generatorFunction: () => Promise<TRefreshToken>;
    validateRefreshTokenDateFunction: TCheckExpirationDateFunction;
    refreshTokenRepository: IRefreshTokenRepository;
    ttlMs: number;
};