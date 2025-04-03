import type {TGenerateAuthTokenFunction, TVerifyAuthTokenFunction} from "../models/authToken.types";

export interface IAuthTokenService {
    generateAuthToken: TGenerateAuthTokenFunction;
    verifyAuthToken: TVerifyAuthTokenFunction;
}