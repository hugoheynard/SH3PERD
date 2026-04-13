import { Module } from '@nestjs/common';
import { PasswordService } from './password-manager/PasswordService.js';
import { createHasherRegistry } from './password-manager/hasherRegistry/createHasherRegistry.js';
import type { IPasswordService } from './password-manager/types/Interfaces.js';
import { getAuthConfig } from '../../appBootstrap/config/getAuthConfig.js';
import { type IAbstractJWTService, JwtService } from './token-manager/JwtService.js';
import {
  type IAbstractRefreshTokenService,
  RefreshTokenService,
} from './token-manager/RefreshTokenService.js';
import { CoreRepositoriesModule } from '../../appBootstrap/database/CoreRepositoriesModule.js';
import { secureCookieConfig } from '../../appBootstrap/config/secureCookieConfig.js';
import type { IRefreshTokenRepository } from '../repositories/RefreshTokenMongoRepository.js';
import { AuthService } from '../services/auth.service.js';
import {
  AUTH_SERVICE,
  JWT_SERVICE,
  PASSWORD_SERVICE,
  REFRESH_TOKEN_SERVICE,
} from '../auth.tokens.js';
import { REFRESH_TOKEN_REPO } from '../../appBootstrap/nestTokens.js';

@Module({
  imports: [CoreRepositoriesModule],
  providers: [
    {
      /**
       * Preconfigured PasswordManager instance using Argon2id v1.
       * Can be imported directly from the package entry point.
       *
       * @example
       * import { passwordManager } from '@sh3pherd/password-manager';
       */
      provide: PASSWORD_SERVICE,
      useFactory: (): IPasswordService => {
        const config = {
          currentStrategyKey: 'argon2id:v1',
          registry: createHasherRegistry(),
          rehashAfterDays: 30,
        };
        return new PasswordService(config);
      },
    },
    {
      provide: JWT_SERVICE,
      useFactory: (): IAbstractJWTService => {
        const authConfig = getAuthConfig();

        return new JwtService({
          options: {
            privateKey: authConfig.privateKey,
            publicKey: authConfig.publicKey,
            accessTokenExpiresIn: authConfig.authToken_TTL_SECONDS,
          },
        });
      },
    },
    {
      provide: REFRESH_TOKEN_SERVICE,
      useFactory: (
        refreshTokenRepository: IRefreshTokenRepository,
      ): IAbstractRefreshTokenService => {
        return new RefreshTokenService(refreshTokenRepository, secureCookieConfig);
      },
      inject: [REFRESH_TOKEN_REPO],
    },
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
  ],
  exports: [AUTH_SERVICE, JWT_SERVICE, REFRESH_TOKEN_SERVICE, PASSWORD_SERVICE],
})
export class AuthCoreModule {}
