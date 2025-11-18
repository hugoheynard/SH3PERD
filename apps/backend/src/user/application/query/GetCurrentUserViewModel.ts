import type { TUserMeViewModel, TUserId } from '@sh3pherd/shared-types';
import { Inject } from '@nestjs/common';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import { USER_CREDENTIALS_REPO } from '../../../appBootstrap/nestTokens.js';
import { UserToCurrentUserViewModelMapper } from '../mappers/UserToCurrentUserViewModelMapper.js';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';


export class GetCurrentUserViewModelQuery {
  constructor(
    public readonly user_id: TUserId
  ) {}
}

/**
 * Handler for retrieving the current user's view model.
 */
@QueryHandler(GetCurrentUserViewModelQuery)
export class GetCurrentUserViewModelHandler
  implements IQueryHandler<GetCurrentUserViewModelQuery, TUserMeViewModel>
{
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredsRepo: IUserCredentialsRepository
  ) {}

  async execute(query: GetCurrentUserViewModelQuery): Promise<TUserMeViewModel> {
    const result = await this.userCredsRepo.findOneUser(query.user_id);

    if(!result) {
      throw new Error('USER_NOT_FOUND');
    }

    return new UserToCurrentUserViewModelMapper(result).map();
  };
}