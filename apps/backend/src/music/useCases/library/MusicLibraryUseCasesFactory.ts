import type { TGetUserMusicLibraryUseCaseFn } from './createGetUserMusicLibraryUseCase.js';
import { createGetUserMusicLibraryUseCase } from './createGetUserMusicLibraryUseCase.js';
import type { TUseCasesFactoryGeneric } from '../../../types/useCases.generic.types.js';

export type TMusicLibraryUseCases = {
  getUserMusicLibrary: TGetUserMusicLibraryUseCaseFn
}

export const musicLibraryUseCasesFactory : TUseCasesFactoryGeneric<TMusicLibraryUseCases> = (deps)=> {
  const { musicVersion} = deps.repositories;


  const getUserMusicLibrary = createGetUserMusicLibraryUseCase({
    getVersionsByUserIdFn: user_id=>musicVersion.findVersionsByUserId(user_id),
  });

  return {
    getUserMusicLibrary
  };
}

export class MusicLibraryUseCasesFactory {
  constructor(
  ) {};

  create(): any {
    return {};
  };
}