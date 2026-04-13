import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import type { TPasswordResetTokenRecord } from '@sh3pherd/shared-types';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { IPasswordResetTokenRepository } from '../../repositories/PasswordResetTokenMongoRepo.js';
import {
  USER_CREDENTIALS_REPO,
  PASSWORD_RESET_TOKEN_REPO,
} from '../../../appBootstrap/nestTokens.js';
import { generateTypedId } from '../../../utils/ids/generateTypedId.js';
import { hashToken } from '../../core/token-manager/hashToken.js';

/** Reset token validity: 1 hour */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export class ForgotPasswordCommand {
  constructor(public readonly email: string) {}
}

/**
 * ForgotPasswordHandler — generates a password reset token.
 *
 * Security:
 * - Always returns success even if email doesn't exist (no email enumeration)
 * - Deletes all previous reset tokens for the user before creating a new one
 * - Token is hashed with SHA-256 before storage (same as refresh tokens)
 * - Raw token is logged to console (no mailer configured yet)
 */
@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, void> {
  private readonly logger = new Logger('Auth');

  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredRepo: IUserCredentialsRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPO)
    private readonly resetTokenRepo: IPasswordResetTokenRepository,
  ) {}

  async execute(cmd: ForgotPasswordCommand): Promise<void> {
    const user = await this.userCredRepo.findOne({ filter: { email: cmd.email } });

    // Silently succeed if user not found — prevents email enumeration
    if (!user || !user.active) return;

    // Delete any previous reset tokens for this user
    await this.resetTokenRepo.deleteMany({ user_id: user.id } as Record<string, unknown>);

    // Generate and hash the token
    const rawToken = generateTypedId('pwReset');
    const hashedToken = hashToken(rawToken);

    const record: TPasswordResetTokenRecord = {
      id: rawToken,
      token: hashedToken,
      user_id: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      createdAt: new Date(),
      usedAt: null,
    };

    await this.resetTokenRepo.save(record);

    // TODO: Replace with actual email sending when mailer is configured
    this.logger.log(`[PasswordReset] Token for ${cmd.email}: ${rawToken}`);
    this.logger.log(
      `[PasswordReset] Reset link: http://localhost:4200/reset-password?token=${rawToken}`,
    );
  }
}
