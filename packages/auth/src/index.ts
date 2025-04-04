// Entry point for @sh3pherd/auth
/**
 * @module auth
 * @description This module provides authentication and authorization functionality for the application.
 */

// Exporting the types and interfaces for the password module
export type {
    THashPasswordFunction as THashPasswordFunction,
    TComparePasswordFunction as TComparePasswordFunction
} from './domain/models/function.types';

// Exporting the types and interfaces for the authToken module
export type {
    TAuthTokenPayload as TAuthTokenPayload,
    TAuthTokenManagerOptions as TTokenManagerOptions
} from './domain/models/authToken.types';

export type {
    TRefreshToken as TRefreshToken,
    TRefreshTokenRecord as TRefreshTokenRecord,
} from './domain/models/refreshToken.types';

//authTokenManager
export type {IAbstractAuthTokenManager as IAbstractAuthTokenManager,} from './domain/models/IAbstractAuthTokenManager';

//refreshTokenManager
export type {
    IAbstractRefreshTokenManager as IAbstractRefreshTokenManager,
    TRefreshTokenManagerInput as TRefreshTokenManagerInput,
} from "./domain/models/IAbstractRefreshTokenManager";

//refreshTokenRepository
export {RefreshTokenMongoRepository as RefreshTokenMongoRepository} from './adapters/repositories/RefreshTokenMongoRepository';

//authTokenService
export {AuthTokenService as AuthTokenService} from './core/services/AuthTokenService';
export type {IAuthTokenService as IAuthTokenService} from './domain/models/IAuthTokenService';
export {createAuthTokenService as createAuthTokenService} from './factories/createAuthTokenService';


// Exporting the types and interfaces for the auth module
export type {IRegisterController} from './api/controllers/IRegisterController';

export {createRegisterRouter as createRegisterRouter} from './api/routes/createRegisterRouter';
export {createRegisterMiddlewares as createRegisterMiddlewares} from './api/middlewares/createRegisterMiddlewares';
export {createRegisterController as createRegisterController} from './api/controllers/createRegisterController';
export {RegisterService as RegisterService} from './core/services/RegisterService';

//Middleware Exports
export {validateRegistrationInput as validateRegistrationInput} from './api/middlewares/validateRegistrationInput';

export type{
    TRevokeRefreshTokenFunction as TRevokeRefreshTokenFunction,
    TVerifyRefreshTokenFunction as TVerifyRefreshTokenFunction,
    TGenerateRefreshTokenFunction as TGenerateRefreshTokenFunction,
    TVerifyAuthTokenFunction as TVerifyAuthTokenFunction,
    TGenerateAuthTokenFunction as TGenerateAuthTokenFunction,
} from "./domain/models/function.types";

export type {
    IRefreshTokenMongoRepositoryInput as IRefreshTokenMongoRepositoryInput,
    IRefreshTokenRepository as IRefreshTokenRepository,
} from "./domain/models/IRefreshTokenRepository";



