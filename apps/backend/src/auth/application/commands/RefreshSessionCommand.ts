import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TRefreshToken, TUserId } from '@sh3pherd/shared-types';
import type { IAuthTokenService } from '../../services/auth.service.js';
import type { IAbstractRefreshTokenService } from '../../core/token-manager/RefreshTokenService.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import type { TRefreshTokenSecureCookie } from '../../types/auth.domain.tokens.js';
import { AUTH_SERVICE, REFRESH_TOKEN_SERVICE } from '../../auth.tokens.js';
import { REFRESH_TOKEN_REPO } from '../../../appBootstrap/nestTokens.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export type TRefreshSessionResult = {
  authToken: string;
  user_id: TUserId;
  refreshTokenSecureCookie: TRefreshTokenSecureCookie;
};

export class RefreshSessionCommand {
  constructor(public readonly refreshToken: TRefreshToken) {}
}

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionHandler implements ICommandHandler<RefreshSessionCommand, TRefreshSessionResult> {
  constructor(
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject(REFRESH_TOKEN_SERVICE) private readonly refreshTokenService: IAbstractRefreshTokenService,
    @Inject(AUTH_SERVICE) private readonly authService: IAuthTokenService,
  ) {}

  async execute(cmd: RefreshSessionCommand): Promise<TRefreshSessionResult> {
    const token = await this.refreshTokenRepo.findOne({ filter: { refreshToken: cmd.refreshToken } });

    if (!token) {
      throw new BusinessError('Refresh token not found', { code: 'TOKEN_NOT_FOUND', status: 401 });
    }

    // Reuse detection: if the token was already revoked, an attacker may have stolen it.
    // Invalidate the entire token family to protect the user.
    if (token.isRevoked) {
      await this.refreshTokenRepo.deleteMany({ family_id: token.family_id });
      throw new BusinessError('Token reuse detected — all sessions in this family have been revoked', { code: 'TOKEN_REUSE_DETECTED', status: 401 });
    }

    const isValid = this.refreshTokenService.verifyRefreshToken({ refreshTokenDomainModel: token });

    if (!isValid) {
      await this.refreshTokenRepo.deleteOne({ refreshToken: cmd.refreshToken });
      throw new BusinessError('Invalid tokens', { code: 'INVALID_TOKENS', status: 401 });
    }

    // Mark current token as revoked (soft-delete for reuse detection)
    await this.refreshTokenRepo.updateOne({
      filter: { refreshToken: cmd.refreshToken } as any,
      update: { $set: { isRevoked: true } } as any,
    });

    // Rotate: create new tokens within the same family
    const session = await this.authService.rotateSession({
      user_id: token.user_id,
      family_id: token.family_id,
    });

    return {
      authToken: session.authToken,
      user_id: token.user_id,
      refreshTokenSecureCookie: session.refreshTokenSecureCookie,
    };
  }
}
