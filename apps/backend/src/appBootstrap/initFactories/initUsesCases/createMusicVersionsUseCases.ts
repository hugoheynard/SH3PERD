import {
  createCreateOneMusicVersionUseCase,
  type TCreateOneMusicVersionUseCase,
} from '../../../music/useCases/createCreateOneMusicVersionUseCase.js';
import type { TUseCasesFactoryGeneric } from '../../../types/useCases.generic.types.js';


export type TMusicVersionsUseCases = {
  createOne: TCreateOneMusicVersionUseCase;
}

export const createMusicVersionsUseCases: TUseCasesFactoryGeneric<TMusicVersionsUseCases> = (deps) => {
  const { musicVersionRepository } = deps.repositories;

  const createOne = createCreateOneMusicVersionUseCase({
    saveOneMusicVersionFn: (document)=>musicVersionRepository.saveOne(document),
  })


  return {
    createOne,
  };
}