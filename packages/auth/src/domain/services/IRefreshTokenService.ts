import type {
    TGenerateRefreshTokenFunction,
    TRevokeRefreshToken,
    TVerifyRefreshToken
} from "../models/refreshToken.types";

export interface IRefreshTokenService {
    generateRefreshToken:TGenerateRefreshTokenFunction;
    verifyRefreshToken:TVerifyRefreshToken;
    revokeRefreshToken:TRevokeRefreshToken;
}