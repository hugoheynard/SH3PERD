// Entry point for @sh3pherd/auth
/**
 * @module auth
 * @description This module provides authentication and authorization functionality for the application.
 */

// Exporting the types and interfaces for the password module


export {TCreateAuthSession as TCreateAuthSession} from './domain/authFunctions.types';

// Exporting the types and interfaces for the authToken module
export type {
    TAuthTokenPayload as TAuthTokenPayload,
    TAuthTokenManagerOptions as TTokenManagerOptions
} from './domain/models/authToken.types';



export type {
    TRefreshToken as TRefreshToken,
    TRefreshTokenDomainModel as TRefreshTokenDomainModel,
} from './domain/models/refreshToken.types';

//authTokenManager
export type {IAbstractAuthTokenManager as IAbstractAuthTokenManager,} from './domain/models/IAbstractAuthTokenManager';

//refreshTokenManager
export type {
    IAbstractRefreshTokenManager as IAbstractRefreshTokenManager,
    TRefreshTokenManagerDeps as TRefreshTokenManagerDeps,
} from "./domain/models/IAbstractRefreshTokenManager";

//refreshTokenRepository
export {RefreshTokenMongoRepository as RefreshTokenMongoRepository} from './adapters/repositories/RefreshTokenMongoRepository';
export {
    //TSaveRefreshToken as TSaveRefreshToken,
    //TFindRefreshToken as TFindRefreshToken,
    //TDeleteRefreshToken as TDeleteRefreshToken,
} from './domain/authFunctions.types';


//authTokenService
export {AuthTokenService as AuthTokenService} from './core/services/AuthTokenService';
export type {IAuthTokenService as IAuthTokenService} from './domain/models/IAuthTokenService';
export {createAuthTokenService as createAuthTokenService} from './factories/createAuthTokenService';


// Exporting the types and interfaces for the auth module
export type {IRegisterController as IRegisterController} from './api/controllers/IRegisterController';

export {createRegisterRouter as createRegisterRouter} from './api/routes/createRegisterRouter';
export {RegisterService as RegisterService} from './core/services/RegisterService';

//Middleware Exports
export {validateRegistrationInput as validateRegistrationInput} from './api/middlewares/validateRegistrationInput';

export {createAuthRouter as createAuthRouter} from './api/routes/createAuthRouter';

export type{
    TRevokeRefreshToken as TRevokeRefreshToken,
    TVerifyRefreshToken as TVerifyRefreshToken,
    TGenerateRefreshToken as TGenerateRefreshToken,
    TVerifyAuthToken as TVerifyAuthToken,
    TGenerateAuthToken as TGenerateAuthToken,
} from "./domain/authFunctions.types";

export type {
    IRefreshTokenRepository as IRefreshTokenRepository,
} from "./domain/models/IRefreshTokenRepository";


//factories
export {createRegisterService as createRegisterService} from '../../bootstrap/src/initServices/createRegisterService';


export {RegisterController as RegisterController} from "./api/controllers/RegisterController";
export {AuthController as AuthController} from "./api/controllers/AuthController";
export {TComparePassword} from "./domain/models/passwordManager.types";
export {THashPassword} from "./domain/models/passwordManager.types";
