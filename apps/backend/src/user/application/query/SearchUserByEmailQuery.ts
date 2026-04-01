import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TUserSearchResult } from '@sh3pherd/shared-types';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';

export class SearchUserByEmailQuery {
  constructor(public readonly email: string) {}
}

/**
 * Searches for a user by email. Returns basic profile info if found, null otherwise.
 */
@QueryHandler(SearchUserByEmailQuery)
export class SearchUserByEmailHandler implements IQueryHandler<SearchUserByEmailQuery, TUserSearchResult | null> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(query: SearchUserByEmailQuery): Promise<TUserSearchResult | null> {
    const creds = await this.credsRepo.findOne({ filter: { email: query.email } });
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
