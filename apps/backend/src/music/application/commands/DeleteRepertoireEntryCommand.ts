import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { TUserId, TRepertoireEntryId } from '@sh3pherd/shared-types';
import { AnalyticsEventService } from '../../../analytics/AnalyticsEventService.js';

export class DeleteRepertoireEntryCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly entryId: TRepertoireEntryId,
  ) {}
}

@CommandHandler(DeleteRepertoireEntryCommand)
export class DeleteRepertoireEntryHandler implements ICommandHandler<
  DeleteRepertoireEntryCommand,
  boolean
> {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
    private readonly analytics: AnalyticsEventService,
  ) {}

  async execute(cmd: DeleteRepertoireEntryCommand): Promise<boolean> {
    const entry = await this.repRepo.findOneByEntryId(cmd.entryId);
    if (!entry) throw new Error('REPERTOIRE_ENTRY_NOT_FOUND');
    if (entry.owner_id !== cmd.actorId) throw new Error('REPERTOIRE_ENTRY_NOT_OWNED');

    const deleted = await this.repRepo.deleteOneByEntryId(cmd.entryId);

    if (deleted) {
      await this.analytics.track('repertoire_entry_deleted', cmd.actorId, {
        entry_id: cmd.entryId,
        reference_id: entry.musicReference_id,
      });
    }

    return deleted;
  }
}
