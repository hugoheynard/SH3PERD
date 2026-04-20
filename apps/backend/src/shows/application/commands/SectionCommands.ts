import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ShowAggregateRepository } from '../../repositories/ShowAggregateRepository.js';
import type {
  TShowDomainModel,
  TShowId,
  TShowSectionId,
  TShowSectionTarget,
  TUserId,
} from '@sh3pherd/shared-types';

// ── Add Section ─────────────────────────────────────────

export class AddShowSectionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly payload: { name: string; target?: TShowSectionTarget },
  ) {}
}

@CommandHandler(AddShowSectionCommand)
@Injectable()
export class AddShowSectionHandler implements ICommandHandler<
  AddShowSectionCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: AddShowSectionCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.addSection(cmd.actorId, cmd.payload);
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}

// ── Update Section ──────────────────────────────────────

export class UpdateShowSectionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
    public readonly payload: { name?: string; target?: TShowSectionTarget | null },
  ) {}
}

@CommandHandler(UpdateShowSectionCommand)
@Injectable()
export class UpdateShowSectionHandler implements ICommandHandler<
  UpdateShowSectionCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: UpdateShowSectionCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    if (cmd.payload.name !== undefined) {
      aggregate.renameSection(cmd.actorId, cmd.sectionId, cmd.payload.name);
    }
    if (cmd.payload.target !== undefined) {
      // Payload target is `T | null`: null means "clear the target",
      // which the domain represents as `undefined`.
      aggregate.setSectionTarget(cmd.actorId, cmd.sectionId, cmd.payload.target ?? undefined);
    }
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}

// ── Remove Section ──────────────────────────────────────

export class RemoveShowSectionCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly sectionId: TShowSectionId,
  ) {}
}

@CommandHandler(RemoveShowSectionCommand)
@Injectable()
export class RemoveShowSectionHandler implements ICommandHandler<
  RemoveShowSectionCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: RemoveShowSectionCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.removeSection(cmd.actorId, cmd.sectionId);
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}

// ── Reorder Sections ────────────────────────────────────

export class ReorderShowSectionsCommand {
  constructor(
    public readonly actorId: TUserId,
    public readonly showId: TShowId,
    public readonly orderedIds: TShowSectionId[],
  ) {}
}

@CommandHandler(ReorderShowSectionsCommand)
@Injectable()
export class ReorderShowSectionsHandler implements ICommandHandler<
  ReorderShowSectionsCommand,
  TShowDomainModel
> {
  constructor(private readonly aggregateRepo: ShowAggregateRepository) {}
  async execute(cmd: ReorderShowSectionsCommand): Promise<TShowDomainModel> {
    const aggregate = await this.aggregateRepo.findById(cmd.showId);
    if (!aggregate) throw new Error('SHOW_NOT_FOUND');
    aggregate.reorderSections(cmd.actorId, cmd.orderedIds);
    await this.aggregateRepo.save(aggregate);
    return aggregate.showEntity.toDomain;
  }
}
