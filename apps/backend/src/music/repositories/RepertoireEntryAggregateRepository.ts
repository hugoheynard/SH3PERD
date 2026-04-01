import type {
  TMusicVersionId,
  TMusicReferenceId,
  TUserId,
} from '@sh3pherd/shared-types';
import type { IMusicVersionRepository } from './MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from './MusicRepertoireRepository.js';
import type { IMusicReferenceRepository } from '../types/musicReferences.types.js';
import { RepertoireEntryAggregate } from '../domain/RepertoireEntryAggregate.js';
import { RepertoireEntryEntity } from '../domain/entities/RepertoireEntryEntity.js';
import { MusicReferenceEntity } from '../domain/entities/MusicReferenceEntity.js';
import { MusicVersionEntity } from '../domain/entities/MusicVersionEntity.js';

// ─── Interface ──────────────────────────────────────────────

export interface IRepertoireEntryAggregateRepository {
  /** Load aggregate starting from a version ID (most common). */
  loadByVersionId(versionId: TMusicVersionId): Promise<RepertoireEntryAggregate>;

  /** Load aggregate by owner + reference (for version creation). */
  loadByOwnerAndReference(ownerId: TUserId, referenceId: TMusicReferenceId): Promise<RepertoireEntryAggregate>;

  /** Persist all changes detected in the aggregate. */
  save(aggregate: RepertoireEntryAggregate): Promise<void>;
}

// ─── Implementation ─────────────────────────────────────────

export class RepertoireEntryAggregateRepository implements IRepertoireEntryAggregateRepository {

  constructor(
    private readonly versionRepo: IMusicVersionRepository,
    private readonly repertoireRepo: IMusicRepertoireRepository,
    private readonly referenceRepo: IMusicReferenceRepository,
  ) {}

  async loadByVersionId(versionId: TMusicVersionId): Promise<RepertoireEntryAggregate> {
    const version = await this.versionRepo.findOneByVersionId(versionId);
    if (!version) throw new Error('MUSIC_VERSION_NOT_FOUND');

    return this.loadByOwnerAndReference(version.owner_id, version.musicReference_id);
  }

  async loadByOwnerAndReference(ownerId: TUserId, referenceId: TMusicReferenceId): Promise<RepertoireEntryAggregate> {
    const [entryDoc, references, versions] = await Promise.all([
      this.repertoireRepo.findByOwnerAndReference(ownerId, referenceId),
      this.referenceRepo.findByIds([referenceId]),
      this.versionRepo.findByOwnerAndReference(ownerId, referenceId),
    ]);

    if (!entryDoc) throw new Error('REPERTOIRE_ENTRY_NOT_FOUND');
    const refDoc = references[0];
    if (!refDoc) throw new Error('MUSIC_REFERENCE_NOT_FOUND');

    const entry = new RepertoireEntryEntity(entryDoc);
    const reference = new MusicReferenceEntity(refDoc);
    const versionEntities = versions.map((v: typeof versions[number]) => new MusicVersionEntity(v));

    return new RepertoireEntryAggregate(entry, reference, versionEntities);
  }

  async save(aggregate: RepertoireEntryAggregate): Promise<void> {
    // 1. Save new versions
    for (const version of aggregate.newVersions) {
      await this.versionRepo.saveOne(version.toDomain);
    }

    // 2. Delete removed versions
    for (const version of aggregate.removedVersions) {
      await this.versionRepo.deleteOneByVersionId(version.id);
    }

    // 3. Update existing versions that have changes
    for (const version of aggregate.existingVersions) {
      const diff = version.getDiffProps();
      if (Object.keys(diff).length > 0) {
        await this.versionRepo.updateVersion(version.id, diff);
      }
    }
  }
}
