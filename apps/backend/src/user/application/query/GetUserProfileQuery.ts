import type { TUserId } from '@sh3pherd/shared-types';
import { SUserProfileDomainModel } from '@sh3pherd/shared-types';
import { ApiModel } from '../../../utils/swagger/api-model.swagger.util.js';
import { createZodDto } from 'nestjs-zod';
import { QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';


@ApiModel()
export class GetUserProfileResponseDTO extends createZodDto(SUserProfileDomainModel) {}

export class GetUserProfileQuery {
  constructor(
    public readonly ctx: { actor_id: TUserId},
    public readonly targetUser_id: TUserId,
  ) {}
}


@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler {
  constructor(
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
  ) {};

  async execute(qry: GetUserProfileQuery): Promise<GetUserProfileResponseDTO | null> {
    const { targetUser_id } = qry;

    const ar = await this.userProfileRepo.findOneViewModelByUserId(targetUser_id);

    if (!ar) {
      return null;
    }

    return ar;
  };
}