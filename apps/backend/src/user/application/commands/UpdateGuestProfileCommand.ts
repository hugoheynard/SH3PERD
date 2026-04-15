import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Filter, UpdateFilter } from 'mongodb';
import type { TUserCredentialsRecord, TUserId, TUserProfileRecord } from '@sh3pherd/shared-types';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';

export type TUpdateGuestProfileDTO = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

export class UpdateGuestProfileCommand {
  constructor(
    public readonly userId: TUserId,
    public readonly patch: TUpdateGuestProfileDTO,
  ) {}
}

/**
 * Updates a guest user's profile and/or email.
 * Only works on users with is_guest: true.
 */
@CommandHandler(UpdateGuestProfileCommand)
export class UpdateGuestProfileHandler implements ICommandHandler<UpdateGuestProfileCommand, void> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(cmd: UpdateGuestProfileCommand): Promise<void> {
    const { userId, patch } = cmd;

    const creds = await this.credsRepo.findOne({ filter: { id: userId } });
    if (!creds) throw new BusinessError('User not found', { code: 'USER_NOT_FOUND', status: 404 });
    if (!creds.is_guest)
      throw new BusinessError('Cannot edit a non-guest user here', {
        code: 'NOT_A_GUEST',
        status: 400,
      });

    // Update email on credentials if changed
    if (patch.email && patch.email !== creds.email) {
      const credentialsFilter: Filter<TUserCredentialsRecord> = { id: userId };
      const credentialsUpdate: UpdateFilter<TUserCredentialsRecord> = {
        $set: { email: patch.email, ...RecordMetadataUtils.update() },
      };

      await this.credsRepo.updateOne({
        filter: credentialsFilter,
        update: credentialsUpdate,
      });
    }

    // Update profile fields
    const profilePatch: Partial<Pick<TUserProfileRecord, 'first_name' | 'last_name' | 'phone'>> =
      {};
    if (patch.first_name !== undefined) profilePatch['first_name'] = patch.first_name;
    if (patch.last_name !== undefined) profilePatch['last_name'] = patch.last_name;
    if (patch.phone !== undefined) profilePatch['phone'] = patch.phone;

    if (Object.keys(profilePatch).length > 0) {
      const profileFilter: Filter<TUserProfileRecord> = { user_id: userId };
      const profileUpdate: UpdateFilter<TUserProfileRecord> = {
        $set: { ...profilePatch, ...RecordMetadataUtils.update() },
      };

      await this.profileRepo.updateOne({
        filter: profileFilter,
        update: profileUpdate,
      });
    }
  }
}
