import { randomUUID } from 'crypto';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TPlaylistId,
  TMusicVersionId,
  TShowId,
  TShowSectionDomainModel,
  TShowSectionId,
  TShowSectionItemDomainModel,
  TShowSectionItemId,
  TShowSectionItemKind,
  TShowSectionTarget,
} from '@sh3pherd/shared-types';

/**
 * A section within a show.
 *
 * Holds an ordered list of items (versions or playlists) as embedded
 * plain domain objects — items don't have their own entity class, they
 * mutate through this entity just like `MusicVersionEntity` exposes its
 * tracks. Positions are kept dense (0..n-1) through every mutation.
 *
 * Structural invariants on items (ownership of `ref_id`, etc.) are
 * checked inside `ShowPolicy` / command handlers since the entity has
 * no visibility on other aggregates.
 */
export class ShowSectionEntity extends Entity<TShowSectionDomainModel> {
  private _items: TShowSectionItemDomainModel[];

  constructor(
    props: TEntityInput<TShowSectionDomainModel>,
    items: TShowSectionItemDomainModel[] = [],
  ) {
    super(
      {
        ...props,
        name: props.name.trim(),
      },
      'showSection',
    );
    if (!this.props.name) {
      throw new Error('SHOW_SECTION_NAME_REQUIRED');
    }
    // Normalise item positions at construction — tolerates DB records
    // that drifted out of sync and pins the invariant from load time.
    this._items = [...items]
      .sort((a, b) => a.position - b.position)
      .map((it, i) => ({ ...it, position: i }));
  }

  // ── getters ─────────────────────────────────────────────

  override get id(): TShowSectionId {
    return this.props.id;
  }
  get show_id(): TShowId {
    return this.props.show_id;
  }
  get name(): string {
    return this.props.name;
  }
  get position(): number {
    return this.props.position;
  }
  get target(): TShowSectionTarget | undefined {
    return this.props.target;
  }
  get lastPlayedAt(): number | undefined {
    return this.props.lastPlayedAt;
  }
  get items(): readonly TShowSectionItemDomainModel[] {
    return this._items;
  }

  // ── queries ─────────────────────────────────────────────

  findItem(itemId: TShowSectionItemId): TShowSectionItemDomainModel | undefined {
    return this._items.find((it) => it.id === itemId);
  }

  hasRef(ref_id: TMusicVersionId | TPlaylistId, kind: TShowSectionItemKind): boolean {
    return this._items.some((it) => it.kind === kind && it.ref_id === ref_id);
  }

  // ── mutations: section metadata ─────────────────────────

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('SHOW_SECTION_NAME_REQUIRED');
    this.props.name = trimmed;
  }

  setTarget(target: TShowSectionTarget | undefined): void {
    this.props.target = target;
  }

  setPosition(position: number): void {
    if (position < 0 || !Number.isInteger(position)) {
      throw new Error('SHOW_SECTION_POSITION_INVALID');
    }
    this.props.position = position;
  }

  markPlayed(playedAt: number = Date.now()): void {
    this.props.lastPlayedAt = playedAt;
  }

  // ── mutations: items ────────────────────────────────────

  /** Add an item at the given position (defaults to end). Returns the created item. */
  addItem(
    kind: TShowSectionItemKind,
    ref_id: TMusicVersionId | TPlaylistId,
    position?: number,
  ): TShowSectionItemDomainModel {
    const item: TShowSectionItemDomainModel = {
      id: `showItem_${randomUUID()}` as TShowSectionItemId,
      section_id: this.id,
      position: 0, // resolved below
      kind,
      ref_id,
    };
    const insertAt =
      position !== undefined && position >= 0 && position <= this._items.length
        ? position
        : this._items.length;
    this._items.splice(insertAt, 0, item);
    this.reindexItems();
    return item;
  }

  removeItem(itemId: TShowSectionItemId): TShowSectionItemDomainModel {
    const idx = this._items.findIndex((it) => it.id === itemId);
    if (idx === -1) throw new Error('SHOW_SECTION_ITEM_NOT_FOUND');
    const [removed] = this._items.splice(idx, 1);
    this.reindexItems();
    return removed;
  }

  /** Reorder items to match the given ordered list of IDs.
   *  Throws if the set of IDs doesn't match the current section items. */
  reorderItems(orderedIds: readonly TShowSectionItemId[]): void {
    if (orderedIds.length !== this._items.length) {
      throw new Error('SHOW_SECTION_ITEMS_REORDER_MISMATCH');
    }
    const byId = new Map(this._items.map((it) => [it.id, it]));
    const next: TShowSectionItemDomainModel[] = [];
    for (const id of orderedIds) {
      const it = byId.get(id);
      if (!it) throw new Error('SHOW_SECTION_ITEMS_REORDER_MISMATCH');
      next.push(it);
      byId.delete(id);
    }
    if (byId.size !== 0) {
      throw new Error('SHOW_SECTION_ITEMS_REORDER_MISMATCH');
    }
    this._items = next;
    this.reindexItems();
  }

  /** Transfer an item out of this section — returns the item so the caller (aggregate)
   *  can hand it to another section's `adoptItem`. */
  detachItem(itemId: TShowSectionItemId): TShowSectionItemDomainModel {
    return this.removeItem(itemId);
  }

  /** Insert an existing item under this section — used by the aggregate during
   *  cross-section moves. Rewrites `section_id` + position. */
  adoptItem(item: TShowSectionItemDomainModel, position?: number): void {
    const adopted: TShowSectionItemDomainModel = {
      ...item,
      section_id: this.id,
      position: 0,
    };
    const insertAt =
      position !== undefined && position >= 0 && position <= this._items.length
        ? position
        : this._items.length;
    this._items.splice(insertAt, 0, adopted);
    this.reindexItems();
  }

  /** Replace the item list wholesale — used when duplicating a show. */
  replaceItems(items: TShowSectionItemDomainModel[]): void {
    this._items = items.map((it, i) => ({ ...it, section_id: this.id, position: i }));
  }

  /** Drop a snapshot of the current item list (plain objects, same shape as storage). */
  get itemsSnapshot(): TShowSectionItemDomainModel[] {
    return this._items.map((it) => ({ ...it }));
  }

  // ── internals ───────────────────────────────────────────

  private reindexItems(): void {
    this._items = this._items.map((it, i) => ({ ...it, position: i }));
  }
}
