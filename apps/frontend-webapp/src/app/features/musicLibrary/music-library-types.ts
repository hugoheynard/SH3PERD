export type SearchMode = 'repertoire' | 'cross' | 'shared' | 'match';
export type TargetMode = 'me' | 'single-user' | 'multiple-users';
export type Rating = 1 | 2 | 3 | 4;

export interface MusicLibraryState {
  references: MusicReference[];
  repertoire: RepertoireEntry[];
  versions: MusicVersion[];
  tabs: MusicTab[];
  activeTabId: string;
}

export type MusicReference = {
  id: string;
  title: string;
  originalArtist: string;
};

export type RepertoireEntry = {
  id: string;
  referenceId: string;
  userId: string;
};

export type MusicVersion = {
  id: string;
  entryId: string;   // links to RepertoireEntry (encodes userId + referenceId)
  label: string;
  durationSeconds?: number;
  notes?: string;
  mastery: Rating;
  energy: Rating;
  effort: Rating;
};

export type MusicTab = {
  id: string;
  title: string;
  autoTitle: boolean;
  searchConfig: MusicSearchConfig;
};

export type MusicSearchConfig = {
  searchMode: SearchMode;
  target: MusicSearchTarget;
  dataFilterActive: boolean;
  dataFilter?: MusicDataFilter;
};

export type MusicSearchTarget = {
  mode: TargetMode;
  userId?: string;
  userIds?: string[];
};

export type MusicDataFilter = {
  mastery?: Rating[];
  energy?: Rating[];
  effort?: Rating[];
};
