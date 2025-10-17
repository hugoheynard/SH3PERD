import type { TUserId } from '@sh3pherd/shared-types';

export type TGetUserMusicLibraryUseCaseFn = (requestDTO: { target_id: TUserId }) => Promise<any>;

export const createGetUserMusicLibraryUseCase = (deps: {
  getVersionsByUserIdFn: (user_id: TUserId) => Promise<any>;
}): TGetUserMusicLibraryUseCaseFn => {
  return async (requestDTO) => {
    try {
      const { target_id } = requestDTO;

      const rawResults = await deps.getVersionsByUserIdFn(target_id);

      return rawResults;

    } catch(error) {
      throw new Error('Error fetching user music library: ');
    }
  }
}