import type {KeyObject} from "crypto";
import type {TUserId} from "../user/index.js";


export type TRefreshToken = `refreshToken_${string}`;

export type TRefreshTokenDomainModel = {
    refreshToken: TRefreshToken;
    user_id: TUserId;
    expiresAt: Date;
    createdAt: Date;
}


export type TAuthTokenPayload = {
    user_id: TUserId;
}

export type TAuthTokenManagerOptions = {
    privateKey: string | Buffer | KeyObject;
    publicKey: string | Buffer | KeyObject;
    accessTokenExpiresIn: number | string;
}

export type TCreateAuthSessionResult = {
    authToken: string
    refreshToken: TRefreshToken
    refreshTokenSecureCookie: TRefreshTokenSecureCookie;
}

export type TRevokeRefreshTokenResult = { revokedToken: TRefreshToken } | false;

export type TSecureCookieConfig = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    maxAge: number;
}

export type TRefreshTokenSecureCookie = {
    name: 'sh3pherd_refreshToken';
    value: TRefreshToken;
    options: TSecureCookieConfig & {
        path: string;
    };
};