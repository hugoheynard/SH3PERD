import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TRegisterUserRequestDTO, TRegisterUserResponseDTO } from '@sh3pherd/shared-types';
import type { IPasswordService } from '../../core/password-manager/types/Interfaces.js';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';
import type { IPlatformContractRepository } from '../../../platform-contract/infra/PlatformContractMongoRepo.js';
import { PASSWORD_SERVICE } from '../../auth.tokens.js';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO, PLATFORM_CONTRACT_REPO } from '../../../appBootstrap/nestTokens.js';
import { UserCredentialEntity } from '../../../user/domain/UserCredential.entity.js';
import { UserProfileEntity } from '../../../user/domain/UserProfileEntity.js';
import { PlatformContractEntity } from '../../../platform-contract/domain/PlatformContractEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class RegisterUserCommand {
  constructor(public readonly payload: TRegisterUserRequestDTO) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, TRegisterUserResponseDTO> {
  constructor(
    @Inject(PASSWORD_SERVICE) private readonly password: IPasswordService,
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
    @Inject(PLATFORM_CONTRACT_REPO) private readonly platformContractRepo: IPlatformContractRepository,
  ) {}

  async execute(cmd: RegisterUserCommand): Promise<TRegisterUserResponseDTO> {
    const existing = await this.userCredsRepo.findOne({ filter: { email: cmd.payload.email } });

    if (existing) {
      throw new BusinessError('email already in use', { code: 'USER_ALREADY_EXISTS', status: 409 });
    }

    const credentials = new UserCredentialEntity({
      email: cmd.payload.email,
      password: await this.password.hashPassword({ password: cmd.payload.password }),
      email_verified: false,
      active: true, is_guest: false,
    });

    const profile = new UserProfileEntity({
      user_id: credentials.id,
      first_name: cmd.payload.first_name,
      last_name: cmd.payload.last_name,
      active: true,
    });

    // Every user gets a platform contract at registration (SaaS subscription).
    // Starts on the Free plan — upgrade is a separate operation.
    const platformContract = new PlatformContractEntity({
      user_id: credentials.id,
      plan: 'plan_free',
      status: 'active',
      startDate: new Date(),
    });

    const session = await this.userCredsRepo.startSession();

    try {
      await session.withTransaction(async () => {
        await this.userCredsRepo.save(
          { ...credentials.toDomain, ...RecordMetadataUtils.create(credentials.id) },
          session,
        );
        await this.userProfileRepo.save(
          { ...profile.toDomain, ...RecordMetadataUtils.create(credentials.id) },
          session,
        );
        await this.platformContractRepo.save(
          { ...platformContract.toDomain, ...RecordMetadataUtils.create(credentials.id) },
          session,
        );
      });

      return credentials.toDomain;
    } finally {
      await session.endSession();
    }
  }
}
