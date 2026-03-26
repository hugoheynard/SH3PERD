import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import type { TUserSearchResult, TUserId } from '@sh3pherd/shared-types';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../appBootstrap/nestTokens.js';
import type { IUserCredentialsRepository } from '../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../infra/UserProfileMongoRepo.repository.js';
import { UserCredentialEntity } from '../domain/UserCredential.entity.js';
import { UserProfileEntity } from '../domain/UserProfileEntity.js';

export type TInviteUserDTO = {
  email: string;
  first_name: string;
  last_name: string;
};

@Injectable()
export class InviteUserUseCase {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(dto: TInviteUserDTO, actorId: TUserId): Promise<TUserSearchResult> {
    const existing = await this.credsRepo.findOne({ filter: { email: dto.email } });
    if (existing) {
      throw new BusinessError('Email already in use', 'USER_ALREADY_EXISTS', 409);
    }

    // Generate a random temporary password — user must reset via "forgot password"
    const tempPasswordHash = await bcrypt.hash(randomUUID(), 10);

    const credentials = new UserCredentialEntity({
      email: dto.email,
      password: tempPasswordHash,
      email_verified: false,
      active: false, // cannot log in until they set their own password
    });

    const profile = new UserProfileEntity({
      user_id: credentials.id,
      first_name: dto.first_name,
      last_name: dto.last_name,
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
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
      };
    } finally {
      await session.endSession();
    }
  }
}
