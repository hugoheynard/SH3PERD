import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_TAB_CONFIGS_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicTabConfigsRepository } from '../../repositories/MusicTabConfigsRepository.js';
import type { TUserId } from '@sh3pherd/shared-types';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class DeleteMusicTabConfigsCommand {
  constructor(public readonly actorId: TUserId) {}
}

@CommandHandler(DeleteMusicTabConfigsCommand)
export class DeleteMusicTabConfigsHandler implements ICommandHandler<
  DeleteMusicTabConfigsCommand,
  boolean
> {
  constructor(
    @Inject(MUSIC_TAB_CONFIGS_REPO) private readonly repo: IMusicTabConfigsRepository,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: DeleteMusicTabConfigsCommand): Promise<boolean> {
    const ok = await this.repo.deleteByUserId(cmd.actorId);

    if (ok) {
      await this.analytics.track('music_tab_configs_deleted', cmd.actorId, {});
    }

    return ok;
  }
}
