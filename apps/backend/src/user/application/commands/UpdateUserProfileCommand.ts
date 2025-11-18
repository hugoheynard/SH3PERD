import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import { Inject } from '@nestjs/common';
import type { TUserId, TUserProfileDomainModel } from '@sh3pherd/shared-types';
import { SUserProfileDomainModel } from '@sh3pherd/shared-types';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import { createZodDto } from 'nestjs-zod';
import { ApiModel } from '../../../utils/swagger/api-model.swagger.util.js';


@ApiModel()
export class UpdateUserProfileResponseDTO extends createZodDto(SUserProfileDomainModel) {}


export class UpdateUserProfileCommand {
  constructor(
    public readonly ctx: { actor_id: TUserId},
    public readonly targetUser_id: TUserId,
    public readonly updateData: Partial<TUserProfileDomainModel>,
  ) {}
}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand, UpdateUserProfileResponseDTO | null> {
  constructor(
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
  ) {};

  async execute(cmd: UpdateUserProfileCommand): Promise<UpdateUserProfileResponseDTO | null> {
    const { ctx, targetUser_id, updateData } = cmd;

    const ar = await this.userProfileRepo.findOneArByUserId(targetUser_id);

    if (!ar) {
      throw new Error('USER_PROFILE_NOT_FOUND');
    }

    if (updateData.first_name && updateData.last_name) {
      ar.rename(
        ctx.actor_id,
        updateData.first_name,
        updateData.last_name,
      );
    }


    return await this.userProfileRepo.updateOneFromAR(ar);
  };
}