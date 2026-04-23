import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_PREFERENCES_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserPreferencesRepository } from '../../infra/UserPreferencesMongoRepo.repository.js';
import type {
  TContractId,
  TUserId,
  TUserPreferencesDomainModel,
  TUserPreferencesRecord,
} from '@sh3pherd/shared-types';
import { UserPreferences } from '../../domain/UserPreferences.entity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';

export class UpdateUserPreferencesCommand {
  constructor(
    public readonly userId: TUserId,
    public readonly patch: Partial<TUserPreferencesDomainModel>,
  ) {}
}

/**
 * Updates user preferences (theme, workspace, etc.).
 * Upserts when no record exists yet — the first update materialises the
 * document so users who predate the preferences collection can still
 * set their workspace/theme without a 404.
 */
@CommandHandler(UpdateUserPreferencesCommand)
export class UpdateUserPreferencesHandler implements ICommandHandler<
  UpdateUserPreferencesCommand,
  TUserPreferencesDomainModel
> {
  constructor(
    @Inject(USER_PREFERENCES_REPO) private readonly prefsRepo: IUserPreferencesRepository,
  ) {}

  async execute(cmd: UpdateUserPreferencesCommand): Promise<TUserPreferencesDomainModel> {
    const record = await this.prefsRepo.findOne({ filter: { user_id: cmd.userId } });

    if (!record) {
      const entity = new UserPreferences({
        user_id: cmd.userId,
        theme: cmd.patch.theme ?? 'dark',
        contract_workspace: (cmd.patch.contract_workspace ?? '') as TContractId,
      });
      const newRecord: TUserPreferencesRecord = {
        ...entity.toDomain,
        ...RecordMetadataUtils.create(cmd.userId),
      };
      await this.prefsRepo.save(newRecord);
      return entity.toDomain;
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
