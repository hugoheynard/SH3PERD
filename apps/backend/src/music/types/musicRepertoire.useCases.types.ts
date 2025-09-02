import type { TUserId } from '@sh3pherd/shared-types';
import type { TUserRepertoireTableRow } from './music.domain.types.js';

export type TMusicRepertoireUseCases = {
  getMusicRepertoireByUserId: TGetMusicRepertoireUseCaseFn;
};

export type TGetMusicRepertoireUseCaseFn = (requestDTO: {
  asker_user_id: TUserId | undefined;
  target_user_id: TUserId | TUserId[] | undefined;
  filter: any;
}) => Promise<Map<TUserId, TUserRepertoireTableRow[]>>;
