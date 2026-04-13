import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import type { IPasswordService } from '../../core/password-manager/types/Interfaces.js';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import type { IPasswordResetTokenRepository } from '../../repositories/PasswordResetTokenMongoRepo.js';
import { PASSWORD_SERVICE } from '../../auth.tokens.js';
import {
  USER_CREDENTIALS_REPO,
  REFRESH_TOKEN_REPO,
  PASSWORD_RESET_TOKEN_REPO,
} from '../../../appBootstrap/nestTokens.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { hashToken } from '../../core/token-manager/hashToken.js';

export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
  ) {}
}

/**
 * ResetPasswordHandler — validates a reset token and sets a new password.
 *
 * Flow:
 * 1. Hash the incoming token and look it up in DB
 * 2. Validate: exists, not expired, not already used
 * 3. Hash the new password
 * 4. Persist the new password
 * 5. Mark the reset token as used
 * 6. Wipe all refresh tokens (force re-login everywhere)
 */
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, void> {
  private readonly logger = new Logger('Auth');

  constructor(
    @Inject(PASSWORD_RESET_TOKEN_REPO)
    private readonly resetTokenRepo: IPasswordResetTokenRepository,
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredRepo: IUserCredentialsRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(cmd: ResetPasswordCommand): Promise<void> {
    // 1. Hash the raw token and find in DB
    const hashedToken = hashToken(cmd.token);
    const resetRecord = await this.resetTokenRepo.findOne({
      filter: { token: hashedToken } as Record<string, unknown>,
    });

    if (!resetRecord) {
      throw new BusinessError('Invalid or expired reset token', {
        code: 'INVALID_RESET_TOKEN',
        status: 400,
      });
    }

    // 2. Validate expiry
    if (new Date(resetRecord.expiresAt) < new Date()) {
      throw new BusinessError('Reset token has expired', {
        code: 'RESET_TOKEN_EXPIRED',
        status: 400,
      });
    }

    // 3. Validate not already used
    if (resetRecord.usedAt) {
      throw new BusinessError('Reset token has already been used', {
        code: 'RESET_TOKEN_USED',
        status: 400,
      });
    }

    // 4. Hash the new password
    const newHash = await this.passwordService.hashPassword({ password: cmd.newPassword });

    // 5. Persist the new password + reset lockout fields
    await this.userCredRepo.updateOne({
      filter: { id: resetRecord.user_id } as Record<string, unknown>,
      update: {
        $set: {
          password: newHash,
          failed_login_count: 0,
          locked_until: null,
        },
      } as Record<string, unknown>,
    });

    // 6. Mark reset token as used
    await this.resetTokenRepo.updateOne({
      filter: { token: hashedToken } as Record<string, unknown>,
      update: { $set: { usedAt: new Date() } } as Record<string, unknown>,
    });

    // 7. Wipe all sessions
    await this.refreshTokenRepo.deleteMany({ user_id: resetRecord.user_id });

    this.logger.log(`[PasswordReset] Password reset completed for user ${resetRecord.user_id}`);
  }
}
