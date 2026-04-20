import type {
  TMusicVersionId,
  TPlaylistId,
  TShowId,
  TShowSectionId,
  TUserId,
} from '@sh3pherd/shared-types';
import { ShowAggregate } from '../ShowAggregate.js';
import { ShowEntity } from '../ShowEntity.js';
import { ShowSectionEntity } from '../ShowSectionEntity.js';

// ─── Typed ID helpers ────────────────────────────────────

export const userId = (n = 1) => `user_test-${n}` as TUserId;
export const showId = (n = 1) => `show_test-${n}` as TShowId;
export const sectionId = (n = 1) => `showSection_test-${n}` as TShowSectionId;
export const versionRefId = (n = 1) => `musicVer_test-${n}` as TMusicVersionId;
export const playlistRefId = (n = 1) => `playlist_test-${n}` as TPlaylistId;

// ─── Factory helpers ─────────────────────────────────────

type MakeShowOverrides = {
  id?: TShowId;
  owner_id?: TUserId;
  name?: string;
  color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet';
  description?: string;
  createdAt?: number;
  updatedAt?: number;
};

export function makeShow(overrides: MakeShowOverrides = {}): ShowEntity {
  return new ShowEntity({
    id: overrides.id ?? showId(),
    owner_id: overrides.owner_id ?? userId(),
    name: overrides.name ?? 'My Show',
    color: overrides.color ?? 'indigo',
    description: overrides.description,
    createdAt: overrides.createdAt ?? 1_700_000_000_000,
    updatedAt: overrides.updatedAt ?? 1_700_000_000_000,
  });
}

type MakeSectionOverrides = {
  id?: TShowSectionId;
  show_id?: TShowId;
  name?: string;
  position?: number;
};

export function makeSection(overrides: MakeSectionOverrides = {}): ShowSectionEntity {
  return new ShowSectionEntity({
    id: overrides.id ?? sectionId(overrides.position ?? 0),
    show_id: overrides.show_id ?? showId(),
    name: overrides.name ?? `Set ${(overrides.position ?? 0) + 1}`,
    position: overrides.position ?? 0,
  });
}

export function makeSectionWithItems(
  overrides: MakeSectionOverrides & {
    items: {
      id: string;
      position: number;
      kind: 'version' | 'playlist';
      ref_id: string;
    }[];
  },
): ShowSectionEntity {
  const sid = overrides.id ?? sectionId(overrides.position ?? 0);
  const owningShow = overrides.show_id ?? showId();
  return new ShowSectionEntity(
    {
      id: sid,
      show_id: owningShow,
      name: overrides.name ?? `Set ${(overrides.position ?? 0) + 1}`,
      position: overrides.position ?? 0,
    },
    overrides.items.map((it) => ({
      id: it.id as ShowSectionEntity['items'][number]['id'],
      section_id: sid,
      position: it.position,
      kind: it.kind,
      ref_id: it.ref_id as ShowSectionEntity['items'][number]['ref_id'],
    })),
  );
}

export function makeAggregate(
  options: {
    owner?: TUserId;
    showName?: string;
    sections?: ShowSectionEntity[];
  } = {},
): ShowAggregate {
  const owner = options.owner ?? userId();
  const show = makeShow({ owner_id: owner, name: options.showName });
  const sections = options.sections ?? [
    makeSection({ show_id: show.id, position: 0, name: 'Set 1' }),
  ];
  return new ShowAggregate(show, sections);
}
