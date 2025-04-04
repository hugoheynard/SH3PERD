import type {TRefreshToken} from "./refreshToken.types";

export type TCreateAuthSessionResult = {
    authToken: string
    refreshToken: TRefreshToken
}

export type TRevokeRefreshTokenResult = { revokedToken: TRefreshToken };