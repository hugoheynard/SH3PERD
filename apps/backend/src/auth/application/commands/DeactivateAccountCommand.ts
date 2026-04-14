import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TUserId } from '@sh3pherd/shared-types';
import type { IPasswordService } from '../../core/password-manager/types/Interfaces.js';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import { PASSWORD_SERVICE } from '../../auth.tokens.js';
import { USER_CREDENTIALS_REPO, REFRESH_TOKEN_REPO } from '../../../appBootstrap/nestTokens.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class DeactivateAccountCommand {
  constructor(
    public readonly userId: TUserId,
    public readonly password: string,
  ) {}
}

@CommandHandler(DeactivateAccountCommand)
export class DeactivateAccountHandler implements ICommandHandler<DeactivateAccountCommand, void> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredRepo: IUserCredentialsRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(REFRESH_TOKEN_REPO) private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(cmd: DeactivateAccountCommand): Promise<void> {
    // 1. Find the user
    const user = await this.userCredRepo.findOne({
      filter: { id: cmd.userId } as Record<string, unknown>,
    });
    if (!user || !user.password) {
      throw new BusinessError('User not found', { code: 'USER_NOT_FOUND', status: 404 });
    }

    // 2. Verify password
    const { isValid } = await this.passwordService.comparePassword({
      password: cmd.password,
      hashedPassword: user.password,
    });
    if (!isValid) {
      throw new BusinessError('Password is incorrect', {
        code: 'INVALID_PASSWORD',
        status: 400,
      });
    }

    // 3. Soft-delete: set active = false
    await this.userCredRepo.updateOne({
      filter: { id: cmd.userId } as Record<string, unknown>,
      update: { $set: { active: false } } as Record<string, unknown>,
    });

    // 4. Invalidate ALL sessions — no way back without admin reactivation
    await this.refreshTokenRepo.deleteMany({ user_id: cmd.userId });
  }
}
