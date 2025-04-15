import type {TRefreshToken} from "./refreshToken.types";
import type {
    TDeleteRefreshToken,
    TGenerateRefreshToken,
    TRevokeRefreshToken,
    TSaveRefreshToken,
    TVerifyRefreshToken
} from "../authFunctions.types";
import type {TDateIsPassed} from "@sh3pherd/shared-utils/date/dateIsPassed";


export interface IAbstractRefreshTokenManager {
    generateRefreshToken: TGenerateRefreshToken;
    verifyRefreshToken: TVerifyRefreshToken;
    revokeRefreshToken: TRevokeRefreshToken;
}

export type TRefreshTokenManagerDeps = {
    generatorFunction: () => Promise<TRefreshToken>;
    validateRefreshTokenDateFn: TDateIsPassed;
    saveTokenFn: TSaveRefreshToken;
    deleteTokenFn: TDeleteRefreshToken;
    ttlMs: number;
};