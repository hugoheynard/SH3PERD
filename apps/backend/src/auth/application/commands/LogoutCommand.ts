import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TRefreshToken, TUserId } from '@sh3pherd/shared-types';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import { REFRESH_TOKEN_REPO } from '../../../appBootstrap/nestTokens.js';

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
      // Find the token to get its family, then delete the entire family
      const token = await this.refreshTokenRepo.findOne({ filter: { refreshToken: cmd.refreshToken } });
      if (token) {
        await this.refreshTokenRepo.deleteMany({ family_id: token.family_id } as any);
      }
    } else {
      // No specific token — revoke all sessions for this user
      await this.refreshTokenRepo.deleteMany({ user_id: cmd.userId });
    }
  }
}
