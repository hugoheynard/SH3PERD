import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import { MUSIC_VERSION_REPO, PLAYLIST_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicVersionRepository } from '../../../music/repositories/MusicVersionRepository.js';
import type { IPlaylistRepository } from '../../../playlists-v2/repositories/PlaylistRepository.js';
import type {
  TMusicVersionId,
  TPlaylistId,
  TShowDomainModel,
  TShowId,
  TShowSectionId,
  TShowSectionItemId,
  TShowSectionItemKind,
  TUserId,
} from '@sh3pherd/shared-types';

/**
 * Verify the target ref belongs to the actor. Cross-aggregate lookup
 * lives in the handler (not in the show aggregate / policy) so the show
 * domain stays free of other aggregates' repositories.
 */
async function assertOwnedRef(
  actorId: TUserId,
  kind: TShowSectionItemKind,
  ref_id: string,
  versionRepo: IMusicVersionRepository,
  playlistRepo: IPlaylistRepository,
): Promise<void> {
  if (kind === 'version') {
    const v = await versionRepo.findOneByVersionId(ref_id as TMusicVersionId);
    if (!v) throw new Error('SHOW_ITEM_VERSION_NOT_FOUND');
    if (v.owner_id !== actorId) throw new Error('SHOW_ITEM_REF_NOT_OWNED');
  } else {
    const p = await playlistRepo.findOneById(ref_id as TPlaylistId);
    if (!p) throw new Error('SHOW_ITEM_PLAYLIST_NOT_FOUND');
    if (p.owner_id !== actorId) throw new Error('SHOW_ITEM_REF_NOT_OWNED');
  }
}

// ── Add item ────────────────────────────────────────────

export class AddShowSectionItemCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
    public readonly payload: {
      kind: TShowSectionItemKind;
      ref_id: TMusicVersionId | TPlaylistId;
      position?: number;
    },
  ) {}
}

@CommandHandler(AddShowSectionItemCommand)
@Injectable()
export class AddShowSectionItemHandler implements ICommandHandler<
  AddShowSectionItemCommand,
  TShowDomainModel
> {
  constructor(
    private readonly aggregateRepo: ShowAggregateRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(PLAYLIST_REPO) private readonly playlistRepo: IPlaylistRepository,
  ) {}

  async execute(cmd: AddShowSectionItemCommand): Promise<TShowDomainModel> {
    await assertOwnedRef(
      cmd.actorId,
      cmd.payload.kind,
      cmd.payload.ref_id,
      this.versionRepo,
      this.playlistRepo,
    );
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.addItemToSection(cmd.actorId, cmd.sectionId, cmd.payload);
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}

// ── Remove item ─────────────────────────────────────────

export class RemoveShowSectionItemCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
    public readonly itemId: TShowSectionItemId,
  ) {}
}

@CommandHandler(RemoveShowSectionItemCommand)
@Injectable()
export class RemoveShowSectionItemHandler implements ICommandHandler<
  RemoveShowSectionItemCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: RemoveShowSectionItemCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.removeItemFromSection(cmd.actorId, cmd.sectionId, cmd.itemId);
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}

// ── Reorder items ───────────────────────────────────────

export class ReorderShowSectionItemsCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
    public readonly orderedIds: TShowSectionItemId[],
  ) {}
}

@CommandHandler(ReorderShowSectionItemsCommand)
@Injectable()
export class ReorderShowSectionItemsHandler implements ICommandHandler<
  ReorderShowSectionItemsCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: ReorderShowSectionItemsCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.reorderItemsInSection(cmd.actorId, cmd.sectionId, cmd.orderedIds);
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}

// ── Move item between sections ──────────────────────────

export class MoveShowSectionItemCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly fromSectionId: TShowSectionId,
    public readonly toSectionId: TShowSectionId,
    public readonly itemId: TShowSectionItemId,
    public readonly position?: number,
  ) {}
}

@CommandHandler(MoveShowSectionItemCommand)
@Injectable()
export class MoveShowSectionItemHandler implements ICommandHandler<
  MoveShowSectionItemCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: MoveShowSectionItemCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.moveItemBetweenSections(cmd.actorId, {
      from: cmd.fromSectionId,
      to: cmd.toSectionId,
      itemId: cmd.itemId,
      position: cmd.position,
    });
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}
