import type { TUserId } from './ids.js';

/**
 * Music tab configuration persisted per user.
 * One document per user in the `music_tab_configs` collection.
 */

export type TMusicTabConfigId = `musicTabCfg_${string}`;

export type TMusicTabConfigsDomainModel = {
  id: TMusicTabConfigId;
  user_id: TUserId;
  tabs: TMusicTabConfig[];
  activeTabId: string;
  activeConfigId?: string;
  savedTabConfigs: TMusicSavedTabConfig[];
};

/** A single tab definition persisted per user. */
export type TMusicTabConfig = {
  id: string;
  title: string;
  autoTitle: boolean;
  searchConfig: TMusicSearchConfig;
  searchQuery?: string;
  color?: string;
};

export type TMusicSavedTabConfig = {
  id: string;
  name: string;
  tabs: TMusicTabConfig[];
  activeTabId: string;
  createdAt: number;
};

export type TMusicSearchConfig = {
  searchMode: 'repertoire' | 'cross' | 'shared' | 'match';
  target: TMusicSearchTarget;
  dataFilterActive: boolean;
  dataFilter?: TMusicDataFilter;
};

export type TMusicSearchTarget = {
  mode: 'me' | 'single-user' | 'multiple-users' | 'contract';
  userId?: string;
  userIds?: string[];
  contractId?: string;
};

export type TNumberRange = { min: number; max: number };

export type TMusicDataFilter = {
  genres?: string[];
  mastery?: number[];
  energy?: number[];
  effort?: number[];
  quality?: number[];
  bpm?: TNumberRange;
  duration?: TNumberRange;
};
