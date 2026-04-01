import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TRegisterUserRequestDTO, TRegisterUserResponseDTO } from '@sh3pherd/shared-types';
import type { IPasswordService } from '../../core/password-manager/types/Interfaces.js';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';
import { PASSWORD_SERVICE } from '../../auth.tokens.js';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import { UserCredentialEntity } from '../../../user/domain/UserCredential.entity.js';
import { UserProfileEntity } from '../../../user/domain/UserProfileEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export class RegisterUserCommand {
  constructor(public readonly payload: TRegisterUserRequestDTO) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, TRegisterUserResponseDTO> {
  constructor(
    @Inject(PASSWORD_SERVICE) private readonly password: IPasswordService,
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(cmd: RegisterUserCommand): Promise<TRegisterUserResponseDTO> {
    const existing = await this.userCredsRepo.findOne({ filter: { email: cmd.payload.email } });

    if (existing) {
      throw new BusinessError('email already in use', 'USER_ALREADY_EXISTS', 409);
    }

    const credentials = new UserCredentialEntity({
      email: cmd.payload.email,
      password: await this.password.hashPassword({ password: cmd.payload.password }),
      email_verified: false,
      active: true,
    });

    const profile = new UserProfileEntity({
      user_id: credentials.id,
      first_name: cmd.payload.first_name,
      last_name: cmd.payload.last_name,
      active: true,
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
      });

      return credentials.toDomain;
    } finally {
      await session.endSession();
    }
  }
}
