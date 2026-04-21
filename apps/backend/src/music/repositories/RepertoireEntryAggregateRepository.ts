import type { ClientSession } from 'mongodb';
import type { TMusicVersionId, TMusicReferenceId, TUserId } from '@sh3pherd/shared-types';
import type { IMusicVersionRepository } from './MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from './MusicRepertoireRepository.js';
import type { IMusicReferenceRepository } from '../types/musicReferences.types.js';
import { RepertoireEntryAggregate } from '../domain/RepertoireEntryAggregate.js';
import { RepertoireEntryEntity } from '../domain/entities/RepertoireEntryEntity.js';
import { MusicReferenceEntity } from '../domain/entities/MusicReferenceEntity.js';
import { MusicVersionEntity } from '../domain/entities/MusicVersionEntity.js';
import { TechnicalError } from '../../utils/errorManagement/TechnicalError.js';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';

// ─── Interface ──────────────────────────────────────────────

export type IRepertoireEntryAggregateRepository = {
  /** Load aggregate starting from a version ID (most common). */
  loadByVersionId(versionId: TMusicVersionId): Promise<RepertoireEntryAggregate>;

  /** Load aggregate by owner + reference (for version creation). */
  loadByOwnerAndReference(
    ownerId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<RepertoireEntryAggregate>;

  /**
   * Persist all changes detected in the aggregate atomically.
   *
   * If `session` is supplied, the three save/delete/update loops run
   * inside the caller's transaction. Otherwise the repo opens its own
   * transaction so a partial write never leaks an inconsistent state
   * (e.g. new versions saved but a delete loop crashed).
   */
  save(aggregate: RepertoireEntryAggregate, session?: ClientSession): Promise<void>;

  /** Expose a MongoDB client session for callers orchestrating cross-repo transactions. */
  startSession(): ClientSession;
};

// ─── Implementation ─────────────────────────────────────────

export class RepertoireEntryAggregateRepository implements IRepertoireEntryAggregateRepository {
  constructor(
    private readonly versionRepo: IMusicVersionRepository,
    private readonly repertoireRepo: IMusicRepertoireRepository,
    private readonly referenceRepo: IMusicReferenceRepository,
  ) {}

  async loadByVersionId(versionId: TMusicVersionId): Promise<RepertoireEntryAggregate> {
    const version = await this.versionRepo.findOneByVersionId(versionId);
    if (!version) {
      throw new BusinessError('Music version not found', {
        code: 'MUSIC_VERSION_NOT_FOUND',
        status: 404,
      });
    }
    return this.loadByOwnerAndReference(version.owner_id, version.musicReference_id);
  }

  async loadByOwnerAndReference(
    ownerId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<RepertoireEntryAggregate> {
    const [entryDoc, references, versions] = await Promise.all([
      this.repertoireRepo.findByOwnerAndReference(ownerId, referenceId),
      this.referenceRepo.findByIds([referenceId]),
      this.versionRepo.findByOwnerAndReference(ownerId, referenceId),
    ]);

    if (!entryDoc) {
      throw new BusinessError('Repertoire entry not found', {
        code: 'REPERTOIRE_ENTRY_NOT_FOUND',
        status: 404,
      });
    }
    const refDoc = references[0];

    if (!refDoc) {
      throw new BusinessError('Music reference not found', {
        code: 'MUSIC_REFERENCE_NOT_FOUND',
        status: 404,
      });
    }

    const entry = new RepertoireEntryEntity(entryDoc);
    const reference = new MusicReferenceEntity(refDoc);
    const versionEntities = versions.map(
      (v: (typeof versions)[number]) => new MusicVersionEntity(v),
    );

    return new RepertoireEntryAggregate(entry, reference, versionEntities);
  }

  startSession(): ClientSession {
    return this.versionRepo.startSession();
  }

  async save(aggregate: RepertoireEntryAggregate, session?: ClientSession): Promise<void> {
    // When the caller owns the transaction we defer to it.
    if (session) {
      await this.writeChanges(aggregate, session);
      return;
    }

    // Otherwise open a short-lived transaction so a partial write
    // cannot leave the aggregate in an inconsistent state.
    const ownSession = this.versionRepo.startSession();
    try {
      await ownSession.withTransaction(async () => {
        await this.writeChanges(aggregate, ownSession);
      });
    } catch (cause) {
      throw new TechnicalError('Failed to persist repertoire aggregate changes', {
        code: 'REPERTOIRE_AGGREGATE_SAVE_FAILED',
        cause: cause instanceof Error ? cause : undefined,
        context: {
          entry_id: aggregate.id,
          owner_id: aggregate.owner_id,
          new_count: aggregate.newVersions.length,
          removed_count: aggregate.removedVersions.length,
          existing_count: aggregate.existingVersions.length,
        },
      });
    } finally {
      await ownSession.endSession();
    }
  }

  private async writeChanges(
    aggregate: RepertoireEntryAggregate,
    session: ClientSession,
  ): Promise<void> {
    // 1. Save new versions
    for (const version of aggregate.newVersions) {
      await this.versionRepo.saveOne(version.toDomain, session);
    }

    // 2. Delete removed versions
    for (const version of aggregate.removedVersions) {
      await this.versionRepo.deleteOneByVersionId(version.id, session);
    }

    // 3. Update existing versions that have changes
    for (const version of aggregate.existingVersions) {
      const diff = version.getDiffProps();
      if (Object.keys(diff).length > 0) {
        await this.versionRepo.updateVersion(version.id, diff, session);
      }
    }
  }
}
