import type { TUserMeViewModel, TUserId } from '@sh3pherd/shared-types';
import { Inject } from '@nestjs/common';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import type { IUserPreferencesRepository } from '../../infra/UserPreferencesMongoRepo.repository.js';
import {
  USER_CREDENTIALS_REPO,
  USER_PROFILE_REPO,
  USER_PREFERENCES_REPO,
} from '../../../appBootstrap/nestTokens.js';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export class GetCurrentUserViewModelQuery {
  constructor(public readonly user_id: TUserId) {}
}

/**
 * Retrieves the current user's view model by composing data from
 * credentials, profile, and preferences collections in parallel.
 */
@QueryHandler(GetCurrentUserViewModelQuery)
export class GetCurrentUserViewModelHandler implements IQueryHandler<
  GetCurrentUserViewModelQuery,
  TUserMeViewModel
> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
    @Inject(USER_PREFERENCES_REPO) private readonly prefsRepo: IUserPreferencesRepository,
  ) {}

  async execute(query: GetCurrentUserViewModelQuery): Promise<TUserMeViewModel> {
    const [creds, profile, preferences] = await Promise.all([
      this.credsRepo.findOne({ filter: { id: query.user_id } }),
      this.profileRepo.findOne({ filter: { user_id: query.user_id } }),
      this.prefsRepo.findOne({ filter: { user_id: query.user_id } }),
    ]);

    if (!creds) {
      throw new BusinessError('User not found', { code: 'USER_NOT_FOUND', status: 404 });
    }

    return {
      id: creds.id,
      profile: profile ?? undefined,
      preferences: preferences ?? undefined,
    } as TUserMeViewModel;
  }
}
