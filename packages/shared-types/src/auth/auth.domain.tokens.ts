import type {KeyObject} from "crypto";
import type {TUserId} from "../user";


export type TRefreshToken = `refreshToken_${string}`;

export type TRefreshTokenDomainModel = {
    refreshToken: TRefreshToken;
    user_id: TUserId;
    expiresAt: Date;
    createdAt: Date;
}


export type TAuthTokenPayload = {
    user_id: string;
}

export type TAuthTokenManagerOptions = {
    privateKey: string | Buffer | KeyObject;
    publicKey: string | Buffer | KeyObject;
    accessTokenExpiresIn: number | string;
}

export type TCreateAuthSessionResult = {
    authToken: string
    refreshToken: TRefreshToken
    user_id: TUserId;
}

export type TRevokeRefreshTokenResult = { revokedToken: TRefreshToken };