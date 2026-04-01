import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { TUserSearchResult, TUserId } from '@sh3pherd/shared-types';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import type { IPasswordService } from '../../../auth/core/password-manager/types/Interfaces.js';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import { PASSWORD_SERVICE } from '../../../auth/auth.tokens.js';
import { UserCredentialEntity } from '../../domain/UserCredential.entity.js';
import { UserProfileEntity } from '../../domain/UserProfileEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export type TInviteUserDTO = {
  email: string;
  first_name: string;
  last_name: string;
};

export class InviteUserCommand {
  constructor(
    public readonly payload: TInviteUserDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Invites a new user by creating credentials (inactive) and a profile.
 * The user must reset their password before logging in.
 * Uses PasswordService instead of direct bcrypt for consistent hashing strategy.
 */
@CommandHandler(InviteUserCommand)
export class InviteUserHandler implements ICommandHandler<InviteUserCommand, TUserSearchResult> {
  constructor(
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(cmd: InviteUserCommand): Promise<TUserSearchResult> {
    const { payload, actorId } = cmd;

    const existing = await this.credsRepo.findOne({ filter: { email: payload.email } });
    if (existing) {
      throw new BusinessError('Email already in use', 'USER_ALREADY_EXISTS', 409);
    }

    const tempPasswordHash = await this.passwordService.hashPassword({ password: randomUUID() });

    const credentials = new UserCredentialEntity({
      email: payload.email,
      password: tempPasswordHash,
      email_verified: false,
      active: false,
    });

    const profile = new UserProfileEntity({
      user_id: credentials.id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      active: true,
    });

    const session = await this.credsRepo.startSession();
    try {
      await session.withTransaction(async () => {
        await this.credsRepo.save(
          { ...credentials.toDomain, ...RecordMetadataUtils.create(actorId) },
          session,
        );
        await this.profileRepo.save(
          { ...profile.toDomain, ...RecordMetadataUtils.create(actorId) },
          session,
        );
      });

      return {
        user_id: credentials.id,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
      };
    } finally {
      await session.endSession();
    }
  }
}
