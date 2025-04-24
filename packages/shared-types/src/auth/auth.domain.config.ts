import type {KeyObject} from "crypto";

export type TAuthConfig = {
    privateKey: string | Buffer | KeyObject;
    publicKey: string | Buffer | KeyObject;
    authToken_TTL_SECONDS: number;
    refreshTokenTTL_MS: number;
}