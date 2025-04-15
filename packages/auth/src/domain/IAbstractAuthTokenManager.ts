import type {TGenerateAuthToken, TVerifyAuthToken} from "../authFunctions.types";

export interface IAbstractAuthTokenManager {
    generateAuthToken: TGenerateAuthToken;
    verifyAuthToken: TVerifyAuthToken;
}