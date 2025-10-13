import type { TGetUserMusicLibraryUseCaseFn } from '../../../music/useCases/createGetUserMusicLibraryUseCase.js';
import { createGetUserMusicLibraryUseCase } from '../../../music/useCases/createGetUserMusicLibraryUseCase.js';
import type { TUseCasesFactoryGeneric } from '../../../types/useCases.generic.types.js';

export type TMusicLibraryUseCases = {
  getUserMusicLibrary: TGetUserMusicLibraryUseCaseFn
}

export const createMusicLibraryUseCases : TUseCasesFactoryGeneric<TMusicLibraryUseCases> = (deps)=> {
  const { musicVersion} = deps.repositories;


  const getUserMusicLibrary = createGetUserMusicLibraryUseCase({
    getVersionsByUserIdFn: user_id=>musicVersion.findVersionsByUserId(user_id),
  });

  return {
    getUserMusicLibrary
  };
}