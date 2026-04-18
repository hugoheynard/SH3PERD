import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TPasswordResetTokenRecord } from '@sh3pherd/shared-types';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';
import type { IPasswordResetTokenRepository } from '../../repositories/PasswordResetTokenMongoRepo.js';
import type { IMailerService } from '../../../mailer/types.js';
import {
  MAILER_SERVICE,
  PASSWORD_RESET_TOKEN_REPO,
  USER_CREDENTIALS_REPO,
  USER_PROFILE_REPO,
} from '../../../appBootstrap/nestTokens.js';
import { generateTypedId } from '../../../utils/ids/generateTypedId.js';
import { hashToken } from '../../core/token-manager/hashToken.js';

/** Reset token validity: 1 hour */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export class ForgotPasswordCommand {
  constructor(public readonly email: string) {}
}

/**
 * ForgotPasswordHandler — generates a password reset token and emails the link.
 *
 * Security:
 * - Always returns success even if email doesn't exist (no email enumeration)
 * - Deletes all previous reset tokens for the user before creating a new one
 * - Token is hashed with SHA-256 before storage (same as refresh tokens)
 * - Mailer failures are caught and logged — they MUST NOT surface to the
 *   caller because an error would leak whether the account exists.
 */
@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, void> {
  private readonly logger = new Logger('Auth');

  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPO)
    private readonly resetTokenRepo: IPasswordResetTokenRepository,
    @Inject(MAILER_SERVICE) private readonly mailer: IMailerService,
    private readonly config: ConfigService,
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
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    const record: TPasswordResetTokenRecord = {
      id: rawToken,
      token: hashedToken,
      user_id: user.id,
      expiresAt,
      createdAt: new Date(),
      usedAt: null,
    };

    await this.resetTokenRepo.save(record);

    // Build the reset link + dispatch the email. Any failure here must not
    // propagate — the endpoint is public and a 500 would leak that the
    // account exists.
    const profile = await this.userProfileRepo.findOne({ filter: { user_id: user.id } });
    const firstName = profile?.first_name ?? 'there';
    const frontendUrl = this.config.get<string>('frontendUrl') ?? 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    try {
      await this.mailer.send({
        to: user.email,
        template: 'password-reset',
        data: { firstName, resetUrl, expiresAt },
      });
    } catch (err) {
      this.logger.error(
        `[PasswordReset] Mailer failed for ${cmd.email} — swallowing to avoid enumeration. ` +
          `reason=${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
