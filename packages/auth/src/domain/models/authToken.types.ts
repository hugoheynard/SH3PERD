import type {KeyObject} from 'crypto'


export type TAuthTokenPayload = {
    user_id: string;
}

export type TAuthTokenManagerOptions = {
    privateKey: string | Buffer | KeyObject;
    publicKey: string | Buffer | KeyObject;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}