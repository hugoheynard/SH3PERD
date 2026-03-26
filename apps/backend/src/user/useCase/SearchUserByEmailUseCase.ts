import { Inject, Injectable } from '@nestjs/common';
import type { TUserSearchResult } from '@sh3pherd/shared-types';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../appBootstrap/nestTokens.js';
import type { IUserCredentialsRepository } from '../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../infra/UserProfileMongoRepo.repository.js';

@Injectable()
export class SearchUserByEmailUseCase {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(email: string): Promise<TUserSearchResult | null> {
    const creds = await this.credsRepo.findOne({ filter: { email } });
    if (!creds) return null;

    const profile = await this.profileRepo.findOne({ filter: { user_id: creds.id } });

    return {
      user_id: creds.id,
      email: creds.email,
      first_name: profile?.first_name,
      last_name: profile?.last_name,
    };
  }
}
