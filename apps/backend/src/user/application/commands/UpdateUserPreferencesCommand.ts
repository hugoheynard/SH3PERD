import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_PREFERENCES_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserPreferencesRepository } from '../../infra/UserPreferencesMongoRepo.repository.js';
import type { TUserId, TUserPreferencesDomainModel } from '@sh3pherd/shared-types';
import { UserPreferences } from '../../domain/UserPreferences.entity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';

export class UpdateUserPreferencesCommand {
  constructor(
    public readonly userId: TUserId,
    public readonly patch: Partial<TUserPreferencesDomainModel>,
  ) {}
}

/**
 * Updates user preferences (theme, workspace, etc.).
 * Pattern: repo.findOne → hydrate entity → mutate → repo.updateOne
 */
@CommandHandler(UpdateUserPreferencesCommand)
export class UpdateUserPreferencesHandler implements ICommandHandler<UpdateUserPreferencesCommand, TUserPreferencesDomainModel> {
  constructor(
    @Inject(USER_PREFERENCES_REPO) private readonly prefsRepo: IUserPreferencesRepository,
  ) {}

  async execute(cmd: UpdateUserPreferencesCommand): Promise<TUserPreferencesDomainModel> {
    const record = await this.prefsRepo.findOne({ filter: { user_id: cmd.userId } });
    if (!record) {
      throw new BusinessError('User preferences not found', 'USER_PREFERENCES_NOT_FOUND', 404);
    }

    const entity = new UserPreferences(RecordMetadataUtils.stripDocMetadata(record));

    if (cmd.patch.theme) {
      entity.setTheme(cmd.patch.theme);
    }
    if (cmd.patch.contract_workspace) {
      entity.changeContractWorkspace(cmd.patch.contract_workspace);
    }

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      await this.prefsRepo.updateOne({
        filter: { user_id: cmd.userId },
        update: { $set: diff },
      });
    }

    return entity.toDomain;
  }
}
