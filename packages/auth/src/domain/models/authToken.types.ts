export type TAuthTokenPayload = {
    user_id: string;
}

export type TAuthTokenManagerOptions = {
    privateKey: string | Buffer | KeyObject;
    publicKey: string | Buffer | KeyObject;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

export type TGenerateAuthTokenFunction = (input: { payload: TAuthTokenPayload }) => Promise<string>;
export type TVerifyAuthTokenFunction = (input: { token: string }) => Promise<TAuthTokenPayload>;

