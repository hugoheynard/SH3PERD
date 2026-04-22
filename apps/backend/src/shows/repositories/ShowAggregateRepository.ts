import { Inject, Injectable } from '@nestjs/common';
import type { TShowId, TUserId } from '@sh3pherd/shared-types';
import { ShowAggregate } from '../domain/ShowAggregate.js';
import { ShowEntity } from '../domain/ShowEntity.js';
import { ShowSectionEntity } from '../domain/ShowSectionEntity.js';
import { SHOW_REPO, SHOW_SECTION_REPO } from '../../appBootstrap/nestTokens.js';
import type { IShowRepository } from './ShowRepository.js';
import type { IShowSectionRepository } from './ShowSectionRepository.js';

/**
 * Loads and persists a `ShowAggregate` — the only entrypoint handlers
 * should use. Wraps the two underlying repos (shows, show_sections)
 * so the aggregate stays ignorant of persistence, and so a future
 * transactional wrapper can be dropped in here without touching any
 * command code.
 *
 * Save strategy:
 * - New show → insert show doc + insert all sections in bulk.
 * - Existing show → upsert show meta, insert new sections, delete
 *   removed sections, rewrite meta + items of existing sections. No
 *   Mongo transaction yet: each document is independently consistent,
 *   and a crash mid-save leaves a slightly stale show but never corrupts
 *   one (the reindex + replaceItems pattern is idempotent on retry).
 */
@Injectable()
export class ShowAggregateRepository {
  constructor(
    @Inject(SHOW_REPO) private readonly showRepo: IShowRepository,
    @Inject(SHOW_SECTION_REPO) private readonly sectionRepo: IShowSectionRepository,
  ) {}

  async findById(showId: TShowId): Promise<ShowAggregate | null> {
    const [showDoc, sectionDocs] = await Promise.all([
      this.showRepo.findOneById(showId),
      this.sectionRepo.findByShowId(showId),
    ]);
    if (!showDoc) return null;
    const show = new ShowEntity(showDoc);
    const sections = sectionDocs
      .sort((a, b) => a.position - b.position)
      .map(
        (doc) =>
          new ShowSectionEntity(
            {
              id: doc.id,
              show_id: doc.show_id,
              name: doc.name,
              description: doc.description,
              position: doc.position,
              target: doc.target,
              lastPlayedAt: doc.lastPlayedAt,
              startAt: doc.startAt,
              axisCriteria: doc.axisCriteria,
            },
            doc.items ?? [],
          ),
      );
    // If the stored doc exists without any section (historical data), the
    // aggregate constructor would throw. Rehydrate with the default "Set 1"
    // placeholder instead — it's a safer recovery than bubbling a 500.
    if (sections.length === 0) {
      sections.push(
        new ShowSectionEntity({
          show_id: show.id,
          name: 'Set 1',
          position: 0,
        }),
      );
    }
    return new ShowAggregate(show, sections);
  }

  async findByOwnerShowIds(
    ownerId: TUserId,
  ): Promise<{ show: ShowEntity; sectionCount: number }[]> {
    const shows = await this.showRepo.findByOwnerId(ownerId);
    if (shows.length === 0) return [];
    // One findMany per show keeps the repository interface simple; the
    // list view never expands items so this is one collection call per
    // show (O(N) on shows, not on items).
    const sectionCounts = await Promise.all(shows.map((s) => this.sectionRepo.findByShowId(s.id)));
    return shows.map((s, i) => ({
      show: new ShowEntity(s),
      sectionCount: sectionCounts[i].length,
    }));
  }

  async save(aggregate: ShowAggregate): Promise<void> {
    const show = aggregate.showEntity;
    // Idempotent whole-doc write keyed by the business `id`. Previously
    // this path did `insertOne` + `updateOne`, which silently created
    // a second row on every save (there's no unique index on `id`, so
    // the `isDuplicateKeyError` catch never fired) — producing one
    // duplicate show document per mutation on a loaded aggregate.
    await this.showRepo.upsertOne(show.toDomain);

    // Sections — insert new, delete removed, rewrite existing.
    const newSectionRecords = aggregate.newSections.map((s) => ({
      id: s.id,
      show_id: s.show_id,
      name: s.name,
      description: s.description,
      position: s.position,
      target: s.target,
      lastPlayedAt: s.lastPlayedAt,
      startAt: s.startAt,
      axisCriteria: s.axisCriteria ? [...s.axisCriteria] : undefined,
      items: s.itemsSnapshot,
    }));
    if (newSectionRecords.length) {
      await this.sectionRepo.saveMany(newSectionRecords);
    }

    const removedIds = aggregate.removedSections.map((s) => s.id);
    if (removedIds.length) {
      await this.sectionRepo.deleteManyByIds(removedIds);
    }

    // Existing sections: rewrite both meta (name/position/target/playedAt)
    // and items in a single round per section. Cheap because there are
    // rarely more than a dozen sections per show in practice.
    for (const section of aggregate.existingSections) {
      await this.sectionRepo.updateMeta(section.id, {
        name: section.name,
        description: section.description ?? null,
        position: section.position,
        target: section.target ?? null,
        lastPlayedAt: section.lastPlayedAt ?? null,
        startAt: section.startAt ?? null,
        axisCriteria: section.axisCriteria ? [...section.axisCriteria] : null,
      });
      await this.sectionRepo.replaceItems(section.id, section.itemsSnapshot);
    }
  }

  async delete(showId: TShowId): Promise<void> {
    await this.sectionRepo.deleteByShowId(showId);
    await this.showRepo.deleteOneById(showId);
  }

  async countByOwner(ownerId: TUserId): Promise<number> {
    return this.showRepo.countByOwnerId(ownerId);
  }
}
