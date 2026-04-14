import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_TAB_CONFIGS_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicTabConfigsRepository } from '../../repositories/MusicTabConfigsRepository.js';
import { QuotaService } from '../../../quota/QuotaService.js';
import type {
  TUserId,
  TMusicTabConfigsDomainModel,
  TMusicTabConfigId,
  TMusicTabConfig,
  TMusicSavedTabConfig,
} from '@sh3pherd/shared-types';

export type TSaveMusicTabConfigsPayload = {
  tabs: TMusicTabConfig[];
  activeTabId: string;
  activeConfigId?: string;
  savedTabConfigs: TMusicSavedTabConfig[];
};

export class SaveMusicTabConfigsCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly payload: TSaveMusicTabConfigsPayload,
  ) {}
}

@CommandHandler(SaveMusicTabConfigsCommand)
export class SaveMusicTabConfigsHandler implements ICommandHandler<SaveMusicTabConfigsCommand, boolean> {
  constructor(
    @Inject(MUSIC_TAB_CONFIGS_REPO) private readonly repo: IMusicTabConfigsRepository,
    private readonly quotaService: QuotaService,
  ) {}

  async execute(cmd: SaveMusicTabConfigsCommand): Promise<boolean> {
    const existing = await this.repo.findByUserId(cmd.actorId);

    // Quota check — only when adding new saved configs
    const existingCount = existing?.savedTabConfigs?.length ?? 0;
    const newCount = cmd.payload.savedTabConfigs.length;
    if (newCount > existingCount) {
      await this.quotaService.ensureAllowed(cmd.actorId, 'search_tab', newCount - existingCount);
    }

    const doc: TMusicTabConfigsDomainModel = {
      id: existing?.id ?? `musicTabCfg_${crypto.randomUUID()}` as TMusicTabConfigId,
      user_id: cmd.actorId,
      tabs: cmd.payload.tabs,
      activeTabId: cmd.payload.activeTabId,
      activeConfigId: cmd.payload.activeConfigId,
      savedTabConfigs: cmd.payload.savedTabConfigs,
    };

    return this.repo.upsert(cmd.actorId, doc);
  }
}
