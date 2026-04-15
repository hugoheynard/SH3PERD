import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import { Inject } from '@nestjs/common';
import type { Filter, UpdateFilter } from 'mongodb';
import type { TUserId, TUserProfileDomainModel, TUserProfileRecord } from '@sh3pherd/shared-types';
import { SUserProfileDomainModel } from '@sh3pherd/shared-types';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import { UserProfileEntity } from '../../domain/UserProfileEntity.js';
import { UserProfilePolicy } from '../../domain/UserProfilePolicy.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { createZodDto } from 'nestjs-zod';
import { ApiModel } from '../../../utils/swagger/api-model.swagger.util.js';

@ApiModel()
export class UserProfileResponseDTO extends createZodDto(SUserProfileDomainModel) {}

export class UpdateUserProfileCommand {
  constructor(
    public readonly ctx: { actor_id: TUserId },
    public readonly targetUser_id: TUserId,
    public readonly updateData: Partial<TUserProfileDomainModel>,
  ) {}
}

/**
 * Updates a user profile. Uses entity + policy directly (no aggregate root).
 * Pattern: repo.findOne → hydrate entity → policy check → entity.mutate → repo.updateOne
 */
@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<
  UpdateUserProfileCommand,
  UserProfileResponseDTO | null
> {
  private readonly policy = new UserProfilePolicy();

  constructor(
    @Inject(USER_PROFILE_REPO) private readonly userProfileRepo: IUserProfileRepository,
  ) {}

  async execute(cmd: UpdateUserProfileCommand): Promise<UserProfileResponseDTO | null> {
    const { ctx, targetUser_id, updateData } = cmd;

    const record = await this.userProfileRepo.findOne({ filter: { user_id: targetUser_id } });

    if (!record) {
      throw new BusinessError('User profile not found', {
        code: 'USER_PROFILE_NOT_FOUND',
        status: 404,
      });
    }

    const entity = new UserProfileEntity(record);

    if (updateData.first_name && updateData.last_name) {
      this.policy.ensureCanModifyProfile(ctx.actor_id, entity);
      entity.rename(updateData.first_name, updateData.last_name);
    }

    const diff = entity.getDiffProps();

    if (Object.keys(diff).length === 0) {
      return record as unknown as UserProfileResponseDTO;
    }

    const filter: Filter<TUserProfileRecord> = { id: record.id };
    const update: UpdateFilter<TUserProfileRecord> = {
      $set: { ...diff, ...RecordMetadataUtils.update() },
    };

    const updated = await this.userProfileRepo.updateOne({ filter, update });

    return (updated ?? record) as unknown as UserProfileResponseDTO;
  }
}
