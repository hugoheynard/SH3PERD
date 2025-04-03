// Entry point for @sh3pherd/auth
/**
 * @module auth
 * @description This module provides authentication and authorization functionality for the application.
 */

// Exporting the types and interfaces for the password module
export type {
    THashPasswordFunction as THashPasswordFunction,
    TComparePasswordFunction as TComparePasswordFunction
} from './domain/types';

// Exporting the types and interfaces for the authToken module
export type {
    TAuthTokenPayload as TAuthTokenPayload,
    TAuthTokenManagerOptions as TTokenManagerOptions
} from './domain/models/authToken.types';

export type {
    TRefreshToken as TRefreshToken,
    TRefreshTokenRecord as TRefreshTokenRecord,
    IRefreshTokenManager as IRefreshTokenManager,
    TRefreshTokenManagerInput as TRefreshTokenManagerInput,
    IRefreshTokenRepository as IRefreshTokenRepository,
    TRevokeRefreshTokenResult as TRevokeRefreshTokenResult,
} from './domain/models/refreshToken.types';

export type {IAuthTokenService as IAuthTokenService} from './domain/services/IAuthTokenService';
export type {IRefreshTokenService as IRefreshTokenService} from './domain/services/IRefreshTokenService';


// Exporting the types and interfaces for the auth module
export type {IRegisterController} from './api/controllers/IRegisterController';

export {createRegisterRouter as createRegisterRouter} from './api/routes/createRegisterRouter';
export {createRegisterMiddlewares as createRegisterMiddlewares} from './api/middlewares/createRegisterMiddlewares';
export {createRegisterController as createRegisterController} from './api/controllers/createRegisterController';
export {RegisterService as RegisterService} from './core/services/RegisterService';

//Middleware Exports
export {validateRegistrationInput as validateRegistrationInput} from './api/middlewares/validateRegistrationInput';

