import type { TShowSectionItemId } from '@sh3pherd/shared-types';
import {
  makeSection,
  makeSectionWithItems,
  playlistRefId,
  sectionId,
  versionRefId,
} from './test-helpers.js';

describe('ShowSectionEntity', () => {
  it('trims the name on construction and rejects empty names', () => {
    const s = makeSection({ name: '  Main set  ' });
    expect(s.name).toBe('Main set');
    expect(() => makeSection({ name: '' })).toThrow('SHOW_SECTION_NAME_REQUIRED');
  });

  it('normalises item positions when loading drifted records', () => {
    // Positions 7 and 2 in the wrong constructor order — the entity must
    // sort them and reindex to 0..1 to pin the invariant from load time.
    const s = makeSectionWithItems({
      id: sectionId(1),
      items: [
        { id: 'showItem_b', position: 7, kind: 'playlist', ref_id: playlistRefId(1) },
        { id: 'showItem_a', position: 2, kind: 'version', ref_id: versionRefId(1) },
      ],
    });
    expect(s.items.map((i) => i.id)).toEqual(['showItem_a', 'showItem_b']);
    expect(s.items.map((i) => i.position)).toEqual([0, 1]);
  });

  describe('addItem', () => {
    it('adds to the end by default and assigns position 0..n-1', () => {
      const s = makeSection();
      s.addItem('version', versionRefId(1));
      s.addItem('playlist', playlistRefId(1));
      expect(s.items).toHaveLength(2);
      expect(s.items[0].kind).toBe('version');
      expect(s.items[0].position).toBe(0);
      expect(s.items[1].kind).toBe('playlist');
      expect(s.items[1].position).toBe(1);
    });

    it('inserts at the given position and reindexes', () => {
      const s = makeSection();
      s.addItem('version', versionRefId(1));
      s.addItem('version', versionRefId(2));
      s.addItem('playlist', playlistRefId(1), 1); // between the two versions
      expect(s.items.map((i) => i.kind)).toEqual(['version', 'playlist', 'version']);
      expect(s.items.map((i) => i.position)).toEqual([0, 1, 2]);
    });
  });

  describe('removeItem', () => {
    it('removes and reindexes remaining items', () => {
      const s = makeSection();
      const a = s.addItem('version', versionRefId(1));
      const b = s.addItem('version', versionRefId(2));
      const c = s.addItem('version', versionRefId(3));
      s.removeItem(b.id);
      expect(s.items.map((i) => i.id)).toEqual([a.id, c.id]);
      expect(s.items.map((i) => i.position)).toEqual([0, 1]);
    });

    it('throws SHOW_SECTION_ITEM_NOT_FOUND on unknown id', () => {
      const s = makeSection();
      expect(() => s.removeItem('showItem_missing' as TShowSectionItemId)).toThrow(
        'SHOW_SECTION_ITEM_NOT_FOUND',
      );
    });
  });

  describe('reorderItems', () => {
    it('rewrites order and positions', () => {
      const s = makeSection();
      const a = s.addItem('version', versionRefId(1));
      const b = s.addItem('version', versionRefId(2));
      const c = s.addItem('version', versionRefId(3));
      s.reorderItems([c.id, a.id, b.id]);
      expect(s.items.map((i) => i.id)).toEqual([c.id, a.id, b.id]);
      expect(s.items.map((i) => i.position)).toEqual([0, 1, 2]);
    });

    it('throws when the payload count or ids do not match', () => {
      const s = makeSection();
      const a = s.addItem('version', versionRefId(1));
      s.addItem('version', versionRefId(2));
      expect(() => s.reorderItems([a.id])).toThrow('SHOW_SECTION_ITEMS_REORDER_MISMATCH');
      expect(() => s.reorderItems([a.id, 'showItem_missing' as TShowSectionItemId])).toThrow(
        'SHOW_SECTION_ITEMS_REORDER_MISMATCH',
      );
    });
  });

  describe('hasRef', () => {
    it('detects existing version and playlist items without confusing kinds', () => {
      const s = makeSection();
      s.addItem('version', versionRefId(1));
      s.addItem('playlist', playlistRefId(1));
      expect(s.hasRef(versionRefId(1), 'version')).toBe(true);
      expect(s.hasRef(playlistRefId(1), 'playlist')).toBe(true);
      // Same id string treated as different kind should not match.
      expect(s.hasRef(versionRefId(1), 'playlist')).toBe(false);
    });
  });

  describe('adoptItem', () => {
    it('rewrites section_id and positions on insert', () => {
      const target = makeSection({ id: sectionId(2) });
      const donor = makeSection({ id: sectionId(1) });
      donor.addItem('version', versionRefId(1));
      const [detached] = donor.items;
      target.adoptItem({ ...detached });
      expect(target.items[0].section_id).toBe(sectionId(2));
      expect(target.items[0].position).toBe(0);
    });
  });
});
