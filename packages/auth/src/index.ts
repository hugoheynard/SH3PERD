// Entry point for @sh3pherd/auth
/**
 * @module auth
 * @description This module provides authentication and authorization functionality for the application.
 */


export * from './core/index.js';
export * from './factories/createAuthTokenService.js';
export * from './repositories/RefreshTokenMongoRepository.js';
export * from './api/controllers/RegisterController.js';
export * from './api/controllers/AuthController.js';


export * from './use-cases/index.js';

export * from './api/routes/createAuthRouter.js';
export * from './api/middlewares/verifyAuthToken.js';


