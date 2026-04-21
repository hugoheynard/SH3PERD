import type { ClientSession } from 'mongodb';
import type { TMusicVersionId, TMusicReferenceId, TUserId } from '@sh3pherd/shared-types';
import type { IMusicVersionRepository } from './MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from './MusicRepertoireRepository.js';
import type { IMusicReferenceRepository } from '../types/musicReferences.types.js';
import { RepertoireEntryAggregate } from '../domain/RepertoireEntryAggregate.js';
import { RepertoireEntryEntity } from '../domain/entities/RepertoireEntryEntity.js';
import { MusicReferenceEntity } from '../domain/entities/MusicReferenceEntity.js';
import { MusicVersionEntity } from '../domain/entities/MusicVersionEntity.js';

// ─── Interface ──────────────────────────────────────────────

export type IRepertoireEntryAggregateRepository = {
  /**
   * Load aggregate starting from a version ID.
   * Returns `null` when the version, its entry, or its reference is missing —
   * the caller decides how to surface it (404 for user actions,
   * 500 for internal/system code paths).
   */
  loadByVersionId(versionId: TMusicVersionId): Promise<RepertoireEntryAggregate | null>;

  /**
   * Load aggregate by owner + reference.
   * Returns `null` when the user has no repertoire entry for that reference,
   * or when the reference itself is missing.
   */
  loadByOwnerAndReference(
    ownerId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<RepertoireEntryAggregate | null>;

  /**
   * Persist all changes detected in the aggregate.
   * When a `session` is provided, all writes participate in the caller's
   * MongoDB transaction (atomic save new / delete removed / update existing).
   */
  save(aggregate: RepertoireEntryAggregate, session?: ClientSession): Promise<void>;
};

// ─── Implementation ─────────────────────────────────────────

export class RepertoireEntryAggregateRepository implements IRepertoireEntryAggregateRepository {
  constructor(
    private readonly versionRepo: IMusicVersionRepository,
    private readonly repertoireRepo: IMusicRepertoireRepository,
    private readonly referenceRepo: IMusicReferenceRepository,
  ) {}

  async loadByVersionId(versionId: TMusicVersionId): Promise<RepertoireEntryAggregate | null> {
    const version = await this.versionRepo.findOneByVersionId(versionId);
    if (!version) return null;

    return this.loadByOwnerAndReference(version.owner_id, version.musicReference_id);
  }

  async loadByOwnerAndReference(
    ownerId: TUserId,
    referenceId: TMusicReferenceId,
  ): Promise<RepertoireEntryAggregate | null> {
    const [entryDoc, references, versions] = await Promise.all([
      this.repertoireRepo.findByOwnerAndReference(ownerId, referenceId),
      this.referenceRepo.findByIds([referenceId]),
      this.versionRepo.findByOwnerAndReference(ownerId, referenceId),
    ]);

    if (!entryDoc) return null;
    const refDoc = references[0];
    if (!refDoc) return null;

    const entry = new RepertoireEntryEntity(entryDoc);
    const reference = new MusicReferenceEntity(refDoc);
    const versionEntities = versions.map(
      (v: (typeof versions)[number]) => new MusicVersionEntity(v),
    );

    return new RepertoireEntryAggregate(entry, reference, versionEntities);
  }

  async save(aggregate: RepertoireEntryAggregate, session?: ClientSession): Promise<void> {
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
