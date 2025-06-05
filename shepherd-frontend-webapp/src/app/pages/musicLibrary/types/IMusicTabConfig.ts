import {TSearchMode, TTargetMode} from './musicLibrary.types';
import {TUserId} from '../../../../types/user.types';
import {TNumberRange_1to4} from '../../../../types/genericNumbers.types';


export interface IMusicTabConfig {
  searchConfiguration: {
    autoTitle: boolean;
    title: string;
    searchMode: TSearchMode;
    target: {
      mode: TTargetMode;
      singleUser?: TUserId;
      multipleUsers?: TUserId[];
    };
    dataFilterActive: boolean;
    exploitationFilterActive: boolean;
  },
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
