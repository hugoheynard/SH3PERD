import type { TUserMeViewModel, TUserId } from '@sh3pherd/shared-types';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserCredentialsRepository } from '../domain/UserCredentialsMongoRepo.repository.js';
import { USER_CREDENTIALS_REPO } from '../../appBootstrap/nestTokens.js';



@Injectable()
export class GetUserMeUseCase {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredsRepo: IUserCredentialsRepository
  ) {}

  async execute(user_id: TUserId): Promise<TUserMeViewModel> {
    const result = await this.userCredsRepo.getUserMe(user_id);

    if(!result) {
      throw new Error('USER_NOT_FOUND');
    }

    return result;
  };
}