/**
 * @deprecated — Legacy types kept for backward compatibility.
 * Use IMusicRepertoireRepository from repositories/MusicRepertoireRepository.ts instead.
 */
import type { TUserId, TMusicRepertoireEntryDomainModel } from '@sh3pherd/shared-types';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';

export type TMusicRepertoireByUserIdPipelineResult = {
  owner_id: TUserId;
  repertoire: TMusicRepertoireEntryDomainModel[];
};

export type TFindMusicRepertoireByUserIdFn = (input: {
  owner_id: TUserId | TUserId[];
}) => Promise<TMusicRepertoireByUserIdPipelineResult[]>;

export type IMusicRepertoireRepository = {
  findRepertoireByUserId: TFindMusicRepertoireByUserIdFn;
} & IBaseCRUD<TMusicRepertoireEntryDomainModel>;
