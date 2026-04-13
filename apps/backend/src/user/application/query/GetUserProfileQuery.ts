import type { TUserId, TUserProfileDomainModel } from '@sh3pherd/shared-types';
import { SUserProfileDomainModel } from '@sh3pherd/shared-types';
import { ApiModel } from '../../../utils/swagger/api-model.swagger.util.js';
import { createZodDto } from 'nestjs-zod';
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';

@ApiModel()
export class GetUserProfileResponseDTO extends createZodDto(SUserProfileDomainModel) {}

export class GetUserProfileQuery {
  constructor(
    public readonly ctx: { actor_id: TUserId },
    public readonly targetUser_id: TUserId,
  ) {}
}

/**
 * Fetches a user profile by user_id. Uses repo.findOne directly (no aggregate root).
 */
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<
  GetUserProfileQuery,
  TUserProfileDomainModel | null
> {
  constructor(
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(qry: GetUserProfileQuery): Promise<TUserProfileDomainModel | null> {
    return await this.userProfileRepo.findOne({ filter: { user_id: qry.targetUser_id } });
  }
}
