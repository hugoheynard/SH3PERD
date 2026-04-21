import { AggregateRoot } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import type {
  TMusicVersionId,
  TPlaylistColor,
  TPlaylistId,
  TShowAxisCriterion,
  TShowId,
  TShowSectionId,
  TShowSectionItemDomainModel,
  TShowSectionItemId,
  TShowSectionItemKind,
  TShowSectionTarget,
  TUserId,
} from '@sh3pherd/shared-types';
import { ShowEntity } from './ShowEntity.js';
import { ShowSectionEntity } from './ShowSectionEntity.js';
import { ShowPolicy } from './ShowPolicy.js';

/**
 * Aggregate root for an artist show.
 *
 * Composes:
 * - The show itself (owner, name, color, lifecycle).
 * - Its ordered sections (≥ 1 by invariant).
 *
 * Every mutation that could affect persistence goes through this
 * aggregate so the repository can rely on a consistent snapshot:
 *   - dirty tracking separates `newSections` / `removedSections` /
 *     `existingSections` for a diff-based save.
 *   - `show.touch()` is called for every mutation, keeping `updatedAt`
 *     in sync with the most recent change (section or item).
 */
export class ShowAggregate extends AggregateRoot {
  private readonly _originalSectionIds: Set<string>;
  private readonly _removedSections: ShowSectionEntity[] = [];

  constructor(
    private readonly show: ShowEntity,
    private readonly sections: ShowSectionEntity[],
    private readonly policy: ShowPolicy = new ShowPolicy(),
  ) {
    super();
    if (sections.length === 0) {
      throw new Error('SHOW_MUST_HAVE_AT_LEAST_ONE_SECTION');
    }
    this._originalSectionIds = new Set(sections.map((s) => s.id));
    this.reindexSections();
  }

  // ── factories ───────────────────────────────────────────

  /** Create a fresh show with a single default section. */
  static create(params: {
    owner_id: TUserId;
    name: string;
    color: TPlaylistColor;
    description?: string;
    defaultSectionName?: string;
    totalDurationTargetSeconds?: number;
    totalTrackCountTarget?: number;
    startAt?: number;
    axisCriteria?: TShowAxisCriterion[];
  }): ShowAggregate {
    const showId = `show_${randomUUID()}` as TShowId;
    const show = new ShowEntity({
      id: showId,
      owner_id: params.owner_id,
      name: params.name,
      color: params.color,
      description: params.description,
      totalDurationTargetSeconds: params.totalDurationTargetSeconds,
      totalTrackCountTarget: params.totalTrackCountTarget,
      startAt: params.startAt,
      axisCriteria: params.axisCriteria,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const section = new ShowSectionEntity({
      show_id: showId,
      name: params.defaultSectionName ?? 'Set 1',
      position: 0,
    });
    return new ShowAggregate(show, [section]);
  }

  // ── identity ────────────────────────────────────────────

  get id(): TShowId {
    return this.show.id;
  }
  get owner_id(): TUserId {
    return this.show.owner_id;
  }
  get showEntity(): ShowEntity {
    return this.show;
  }
  get allSections(): readonly ShowSectionEntity[] {
    return this.sections;
  }

  findSection(sectionId: TShowSectionId): ShowSectionEntity | undefined {
    return this.sections.find((s) => s.id === sectionId);
  }

  // ── dirty tracking (repository entrypoint) ──────────────

  /** Sections added since load. */
  get newSections(): ShowSectionEntity[] {
    return this.sections.filter((s) => !this._originalSectionIds.has(s.id));
  }

  /** Sections removed since load. */
  get removedSections(): readonly ShowSectionEntity[] {
    return this._removedSections;
  }

  /** Sections that existed at load and still exist (may have changes). */
  get existingSections(): ShowSectionEntity[] {
    return this.sections.filter((s) => this._originalSectionIds.has(s.id));
  }

  // ── show-level mutations (ownership-guarded) ────────────

  rename(actorId: TUserId, name: string): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.rename(name);
  }

  updateDescription(actorId: TUserId, description: string | undefined): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.updateDescription(description);
  }

  changeColor(actorId: TUserId, color: TPlaylistColor): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.changeColor(color);
  }

  setTotalDurationTarget(actorId: TUserId, seconds: number | undefined): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.setTotalDurationTarget(seconds);
  }

  setTotalTrackCountTarget(actorId: TUserId, count: number | undefined): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.setTotalTrackCountTarget(count);
  }

  setShowStartAt(actorId: TUserId, startAt: number | undefined): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.setStartAt(startAt);
  }

  setShowAxisCriteria(actorId: TUserId, criteria: readonly TShowAxisCriterion[] | undefined): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.setAxisCriteria(criteria);
  }

  markShowPlayed(actorId: TUserId, playedAt: number = Date.now()): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.show.markPlayed(playedAt);
    for (const section of this.sections) {
      section.markPlayed(playedAt);
    }
  }

  // ── section lifecycle ───────────────────────────────────

  addSection(
    actorId: TUserId,
    params: {
      name: string;
      target?: TShowSectionTarget;
      startAt?: number;
      axisCriteria?: TShowAxisCriterion[];
    },
  ): ShowSectionEntity {
    this.policy.ensureOwnedBy(actorId, this.show);
    const section = new ShowSectionEntity({
      show_id: this.show.id,
      name: params.name,
      position: this.sections.length,
      target: params.target,
      startAt: params.startAt,
      axisCriteria: params.axisCriteria,
    });
    this.sections.push(section);
    this.show.touch();
    return section;
  }

  removeSection(actorId: TUserId, sectionId: TShowSectionId): ShowSectionEntity {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.policy.ensureCanRemoveSection(this.sections);
    const idx = this.sections.findIndex((s) => s.id === sectionId);
    if (idx === -1) throw new Error('SHOW_SECTION_NOT_FOUND');
    const [removed] = this.sections.splice(idx, 1);
    this._removedSections.push(removed);
    this.reindexSections();
    this.show.touch();
    return removed;
  }

  reorderSections(actorId: TUserId, orderedIds: readonly TShowSectionId[]): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.policy.ensureReorderCovers(this.sections, orderedIds);
    const byId = new Map(this.sections.map((s) => [s.id, s]));
    this.sections.length = 0;
    for (const id of orderedIds) {
      this.sections.push(byId.get(id)!);
    }
    this.reindexSections();
    this.show.touch();
  }

  renameSection(actorId: TUserId, sectionId: TShowSectionId, name: string): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.getSectionOrThrow(sectionId).rename(name);
    this.show.touch();
  }

  setSectionTarget(
    actorId: TUserId,
    sectionId: TShowSectionId,
    target: TShowSectionTarget | undefined,
  ): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.getSectionOrThrow(sectionId).setTarget(target);
    this.show.touch();
  }

  setSectionStartAt(
    actorId: TUserId,
    sectionId: TShowSectionId,
    startAt: number | undefined,
  ): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.getSectionOrThrow(sectionId).setStartAt(startAt);
    this.show.touch();
  }

  setSectionAxisCriteria(
    actorId: TUserId,
    sectionId: TShowSectionId,
    criteria: readonly TShowAxisCriterion[] | undefined,
  ): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.getSectionOrThrow(sectionId).setAxisCriteria(criteria);
    this.show.touch();
  }

  markSectionPlayed(
    actorId: TUserId,
    sectionId: TShowSectionId,
    playedAt: number = Date.now(),
  ): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.getSectionOrThrow(sectionId).markPlayed(playedAt);
    this.show.touch();
  }

  // ── item lifecycle ──────────────────────────────────────

  addItemToSection(
    actorId: TUserId,
    sectionId: TShowSectionId,
    params: {
      kind: TShowSectionItemKind;
      ref_id: TMusicVersionId | TPlaylistId;
      position?: number;
    },
  ): TShowSectionItemDomainModel {
    this.policy.ensureOwnedBy(actorId, this.show);
    const section = this.getSectionOrThrow(sectionId);
    const item = section.addItem(params.kind, params.ref_id, params.position);
    this.show.touch();
    return item;
  }

  removeItemFromSection(
    actorId: TUserId,
    sectionId: TShowSectionId,
    itemId: TShowSectionItemId,
  ): TShowSectionItemDomainModel {
    this.policy.ensureOwnedBy(actorId, this.show);
    const section = this.getSectionOrThrow(sectionId);
    const removed = section.removeItem(itemId);
    this.show.touch();
    return removed;
  }

  reorderItemsInSection(
    actorId: TUserId,
    sectionId: TShowSectionId,
    orderedIds: readonly TShowSectionItemId[],
  ): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    this.getSectionOrThrow(sectionId).reorderItems(orderedIds);
    this.show.touch();
  }

  moveItemBetweenSections(
    actorId: TUserId,
    params: {
      from: TShowSectionId;
      to: TShowSectionId;
      itemId: TShowSectionItemId;
      position?: number;
    },
  ): void {
    this.policy.ensureOwnedBy(actorId, this.show);
    if (params.from === params.to) {
      throw new Error('SHOW_ITEM_MOVE_SAME_SECTION');
    }
    const source = this.getSectionOrThrow(params.from);
    const target = this.getSectionOrThrow(params.to);
    const detached = source.detachItem(params.itemId);
    target.adoptItem(detached, params.position);
    this.show.touch();
  }

  // ── duplicate ───────────────────────────────────────────

  /** Produce a deep copy of this show for the same owner, with fresh IDs
   *  everywhere and a `(copy)` suffix on the name. All sections and
   *  items are reset in-memory; the returned aggregate is treated as
   *  "new" by the repository. */
  duplicateFor(actorId: TUserId): ShowAggregate {
    this.policy.ensureOwnedBy(actorId, this.show);
    const newShowId = `show_${randomUUID()}` as TShowId;
    const clonedShow = new ShowEntity({
      id: newShowId,
      owner_id: this.show.owner_id,
      name: `${this.show.name} (copy)`,
      color: this.show.color,
      description: this.show.description,
      totalDurationTargetSeconds: this.show.totalDurationTargetSeconds,
      totalTrackCountTarget: this.show.totalTrackCountTarget,
      // Do NOT copy startAt — a scheduled show should not clone the
      // date; duplicates are templates to reschedule.
      axisCriteria: this.show.axisCriteria
        ? this.show.axisCriteria.map((c) => ({ ...c }))
        : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const clonedSections = this.sections.map((src, idx) => {
      const newSectionId = `showSection_${randomUUID()}` as TShowSectionId;
      const section = new ShowSectionEntity({
        id: newSectionId,
        show_id: newShowId,
        name: src.name,
        position: idx,
        target: src.target,
        // Same rule as the show: clones lose the schedule.
        axisCriteria: src.axisCriteria ? src.axisCriteria.map((c) => ({ ...c })) : undefined,
      });
      const clonedItems = src.items.map((it) => ({
        ...it,
        id: `showItem_${randomUUID()}` as TShowSectionItemId,
        section_id: newSectionId,
      }));
      section.replaceItems(clonedItems);
      return section;
    });
    return new ShowAggregate(clonedShow, clonedSections);
  }

  // ── internals ───────────────────────────────────────────

  private getSectionOrThrow(sectionId: TShowSectionId): ShowSectionEntity {
    const section = this.findSection(sectionId);
    if (!section) throw new Error('SHOW_SECTION_NOT_FOUND');
    return section;
  }

  private reindexSections(): void {
    this.sections.forEach((s, i) => s.setPosition(i));
  }
}
