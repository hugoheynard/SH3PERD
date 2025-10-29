import type { TUserId } from '@sh3pherd/shared-types';
import type { TMusicRepertoireEntryDomainModel, TUserRepertoireTableRow } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export type TMusicRepertoireByUserIdPipelineResult = {
  user_id: TUserId;
  repertoire: TUserRepertoireTableRow[];
};

/**
 * MusicRepertoire Repository Core Types
 */
export type TFindMusicRepertoireByUserIdFn = (input: {
  user_id: TUserId | TUserId[];
}) => Promise<TMusicRepertoireByUserIdPipelineResult[]>;

// Repository interface for Music Repertoire
export interface IMusicRepertoireRepository extends IBaseCRUD<TMusicRepertoireEntryDomainModel> {
  findRepertoireByUserId: TFindMusicRepertoireByUserIdFn;
}
