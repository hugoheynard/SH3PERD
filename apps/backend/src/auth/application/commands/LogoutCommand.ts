import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TRefreshToken, TUserId } from '@sh3pherd/shared-types';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import { REFRESH_TOKEN_REPO } from '../../../appBootstrap/nestTokens.js';
import { hashToken } from '../../core/token-manager/hashToken.js';

export class LogoutCommand {
  constructor(
    public readonly userId: TUserId,
    public readonly refreshToken?: TRefreshToken,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(cmd: LogoutCommand): Promise<void> {
    if (cmd.refreshToken) {
      // Hash the raw cookie value to match the stored hash
      const hashedToken = hashToken(cmd.refreshToken);
      const token = await this.refreshTokenRepo.findOne({
        filter: { refreshToken: hashedToken },
      });
      if (token) {
        // Soft-delete the entire family (preserves reuse detection)
        await this.refreshTokenRepo.updateOne({
          filter: { family_id: token.family_id } as Record<string, unknown>,
          update: { $set: { isRevoked: true } } as Record<string, unknown>,
        });
      }
    } else {
      // No specific token — revoke all sessions for this user
      await this.refreshTokenRepo.deleteMany({ user_id: cmd.userId });
    }
  }
}
