import type { TShowSectionId, TShowSectionItemId } from '@sh3pherd/shared-types';
import { ShowAggregate } from '../ShowAggregate.js';
import {
  makeAggregate,
  makeSection,
  playlistRefId,
  sectionId,
  showId,
  userId,
  versionRefId,
} from './test-helpers.js';

describe('ShowAggregate', () => {
  describe('create', () => {
    it('builds a show with exactly one default section', () => {
      const agg = ShowAggregate.create({
        owner_id: userId(),
        name: 'Sunset',
        color: 'amber',
      });
      expect(agg.allSections).toHaveLength(1);
      expect(agg.allSections[0].name).toBe('Set 1');
      expect(agg.allSections[0].position).toBe(0);
    });

    it('refuses construction with zero sections', () => {
      const show = ShowAggregate.create({
        owner_id: userId(),
        name: 'X',
        color: 'indigo',
      }).showEntity;
      expect(() => new ShowAggregate(show, [])).toThrow('SHOW_MUST_HAVE_AT_LEAST_ONE_SECTION');
    });
  });

  describe('show metadata mutations', () => {
    it('renames through the aggregate and enforces ownership', () => {
      const owner = userId(1);
      const agg = makeAggregate({ owner });
      agg.rename(owner, 'New name');
      expect(agg.showEntity.name).toBe('New name');
      expect(() => agg.rename(userId(2), 'Other')).toThrow('SHOW_NOT_OWNED');
    });

    it('markShowPlayed stamps all sections with the same timestamp', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      agg.addSection(owner, { name: 'Encore' });
      agg.markShowPlayed(owner, 42);
      expect(agg.showEntity.lastPlayedAt).toBe(42);
      for (const s of agg.allSections) expect(s.lastPlayedAt).toBe(42);
    });
  });

  describe('section lifecycle', () => {
    it('adds a section at the end with the next position', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const added = agg.addSection(owner, { name: 'Encore' });
      expect(agg.allSections).toHaveLength(2);
      expect(added.position).toBe(1);
      expect(agg.newSections).toEqual([added]);
    });

    it('removeSection refuses to delete the last remaining section', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      expect(() => agg.removeSection(owner, agg.allSections[0].id)).toThrow(
        'SHOW_LAST_SECTION_CANNOT_BE_REMOVED',
      );
    });

    it('removeSection tracks the removal and re-densifies positions', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const b = agg.addSection(owner, { name: 'Middle' });
      agg.addSection(owner, { name: 'End' });
      agg.removeSection(owner, b.id);
      expect(agg.allSections).toHaveLength(2);
      expect(agg.allSections.map((s) => s.position)).toEqual([0, 1]);
      expect(agg.removedSections).toEqual([b]);
    });

    it('reorderSections rewrites the order and positions', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const b = agg.addSection(owner, { name: 'B' });
      const c = agg.addSection(owner, { name: 'C' });
      const a = agg.allSections[0];
      agg.reorderSections(owner, [c.id, a.id, b.id]);
      expect(agg.allSections.map((s) => s.id)).toEqual([c.id, a.id, b.id]);
      expect(agg.allSections.map((s) => s.position)).toEqual([0, 1, 2]);
    });

    it('reorderSections throws on mismatched id set', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      agg.addSection(owner, { name: 'B' });
      expect(() => agg.reorderSections(owner, ['showSection_missing' as TShowSectionId])).toThrow(
        'SHOW_SECTIONS_REORDER_MISMATCH',
      );
    });

    it('renameSection and setSectionTarget mutate the target section only', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const b = agg.addSection(owner, { name: 'Original' });
      agg.renameSection(owner, b.id, 'Renamed');
      agg.setSectionTarget(owner, b.id, { mode: 'duration', duration_s: 600 });
      expect(b.name).toBe('Renamed');
      expect(b.target).toEqual({ mode: 'duration', duration_s: 600 });
      expect(agg.allSections[0].target).toBeUndefined();
    });
  });

  describe('item lifecycle', () => {
    it('adds items to the right section', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const section = agg.allSections[0];
      agg.addItemToSection(owner, section.id, {
        kind: 'version',
        ref_id: versionRefId(1),
      });
      agg.addItemToSection(owner, section.id, {
        kind: 'playlist',
        ref_id: playlistRefId(1),
      });
      expect(section.items).toHaveLength(2);
      expect(section.items[0].kind).toBe('version');
      expect(section.items[1].kind).toBe('playlist');
    });

    it('moveItemBetweenSections re-parents the item and reindexes both sections', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const a = agg.allSections[0];
      const b = agg.addSection(owner, { name: 'B' });
      const item = agg.addItemToSection(owner, a.id, {
        kind: 'version',
        ref_id: versionRefId(1),
      });
      agg.moveItemBetweenSections(owner, {
        from: a.id,
        to: b.id,
        itemId: item.id,
      });
      expect(a.items).toHaveLength(0);
      expect(b.items).toHaveLength(1);
      expect(b.items[0].section_id).toBe(b.id);
      expect(b.items[0].position).toBe(0);
    });

    it('moveItemBetweenSections rejects a same-section move', () => {
      const owner = userId();
      const agg = makeAggregate({ owner });
      const a = agg.allSections[0];
      const item = agg.addItemToSection(owner, a.id, {
        kind: 'version',
        ref_id: versionRefId(1),
      });
      expect(() =>
        agg.moveItemBetweenSections(owner, {
          from: a.id,
          to: a.id,
          itemId: item.id,
        }),
      ).toThrow('SHOW_ITEM_MOVE_SAME_SECTION');
    });

    it('removeItemFromSection reindexes and bumps the show clock', () => {
      const owner = userId();
      const agg = makeAggregate({ owner, showName: 'X' });
      const section = agg.allSections[0];
      const initialUpdatedAt = agg.showEntity.toDomain.updatedAt;
      const a = agg.addItemToSection(owner, section.id, {
        kind: 'version',
        ref_id: versionRefId(1),
      });
      const b = agg.addItemToSection(owner, section.id, {
        kind: 'version',
        ref_id: versionRefId(2),
      });
      agg.removeItemFromSection(owner, section.id, a.id);
      expect(section.items.map((i) => i.id)).toEqual([b.id]);
      expect(agg.showEntity.toDomain.updatedAt).toBeGreaterThan(initialUpdatedAt);
    });
  });

  describe('dirty tracking', () => {
    it('treats freshly added sections as new, loaded ones as existing', () => {
      const owner = userId();
      const loadedSection = makeSection({ id: sectionId(1), show_id: showId(), position: 0 });
      const show = makeAggregate({
        owner,
        sections: [loadedSection],
      }).showEntity;
      const agg = new ShowAggregate(show, [loadedSection]);
      expect(agg.newSections).toHaveLength(0);
      expect(agg.existingSections).toEqual([loadedSection]);

      const added = agg.addSection(owner, { name: 'New one' });
      expect(agg.newSections).toEqual([added]);
      expect(agg.existingSections).toEqual([loadedSection]);
    });
  });

  describe('duplicateFor', () => {
    it('deep-clones sections and items with fresh ids and a "(copy)" suffix', () => {
      const owner = userId();
      const agg = makeAggregate({ owner, showName: 'Original' });
      const s0 = agg.allSections[0];
      agg.addItemToSection(owner, s0.id, { kind: 'version', ref_id: versionRefId(1) });
      agg.addSection(owner, { name: 'Encore' });
      agg.addItemToSection(owner, agg.allSections[1].id, {
        kind: 'playlist',
        ref_id: playlistRefId(1),
      });

      const copy = agg.duplicateFor(owner);
      expect(copy.showEntity.name).toBe('Original (copy)');
      expect(copy.id).not.toBe(agg.id);
      expect(copy.allSections).toHaveLength(2);

      const allOriginalSectionIds = new Set(agg.allSections.map((s) => s.id));
      const allOriginalItemIds = new Set(
        agg.allSections.flatMap((s) => s.items.map((i) => i.id as string)),
      );
      for (const section of copy.allSections) {
        expect(allOriginalSectionIds.has(section.id)).toBe(false);
        for (const item of section.items) {
          expect(allOriginalItemIds.has(item.id)).toBe(false);
          expect(item.section_id).toBe(section.id);
        }
      }
      expect(copy.allSections[0].items.map((i) => i.ref_id)).toEqual([versionRefId(1)]);
      expect(copy.allSections[1].items.map((i) => i.ref_id)).toEqual([playlistRefId(1)]);
    });

    it('rejects duplication by a non-owner', () => {
      const owner = userId(1);
      const agg = makeAggregate({ owner });
      expect(() => agg.duplicateFor(userId(2))).toThrow('SHOW_NOT_OWNED');
    });
  });

  describe('ownership on item operations', () => {
    it('blocks all item mutations from a non-owner', () => {
      const owner = userId(1);
      const intruder = userId(2);
      const agg = makeAggregate({ owner });
      const section = agg.allSections[0];
      expect(() =>
        agg.addItemToSection(intruder, section.id, {
          kind: 'version',
          ref_id: versionRefId(1),
        }),
      ).toThrow('SHOW_NOT_OWNED');
      expect(() =>
        agg.removeItemFromSection(intruder, section.id, 'showItem_missing' as TShowSectionItemId),
      ).toThrow('SHOW_NOT_OWNED');
      expect(() => agg.reorderItemsInSection(intruder, section.id, [])).toThrow('SHOW_NOT_OWNED');
    });
  });
});
