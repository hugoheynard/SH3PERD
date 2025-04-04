import type {TGenerateAuthTokenFunction, TVerifyAuthTokenFunction} from "./function.types";

export interface IAbstractAuthTokenManager {
    generateAuthToken: TGenerateAuthTokenFunction;
    verifyAuthToken: TVerifyAuthTokenFunction;
}