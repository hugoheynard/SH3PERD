import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_TAB_CONFIGS_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicTabConfigsRepository } from '../../repositories/MusicTabConfigsRepository.js';
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
  ) {}

  async execute(cmd: SaveMusicTabConfigsCommand): Promise<boolean> {
    const existing = await this.repo.findByUserId(cmd.actorId);

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
