import type {TSearchMode, TTargetMode} from './musicLibrary.types';
import type {TNumberRange_1to4} from '../../../../types/genericNumbers.types';
import type { TUserId } from '@sh3pherd/shared-types';

export type TMusicTabTitle = {
  autoTitle: boolean;
  title: string;
}

export type TMusicSearchFilter = {
  searchConfiguration: {
    searchMode: TSearchMode;
    target: {
      mode: TTargetMode;
      singleUser_id?: TUserId;
      multipleUsers_id?: TUserId[];
    };
    dataFilterActive: boolean;
    exploitationFilterActive: boolean;
  };
  dataFilterOptions?: {
    repertoire: {
      genre: string[];
      energy: TNumberRange_1to4[];
      effort: TNumberRange_1to4[];
    mastery: TNumberRange_1to4[];
  }
};
exploitationFilterOptions?: {}
}

export type TMusicTabConfiguration = TMusicTabTitle & TMusicSearchFilter;
