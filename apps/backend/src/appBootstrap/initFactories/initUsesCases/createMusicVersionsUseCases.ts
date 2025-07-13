import {
  createCreateOneMusicVersionUseCase,
  type TCreateOneMusicVersionUseCase,
} from '../../../music/useCases/createCreateOneMusicVersionUseCase.js';


export type TMusicVersionsUseCases = {
  createOne: TCreateOneMusicVersionUseCase;
}

export const createMusicVersionsUseCases = (deps: any): any => {
  const { musicVersionRepository } = deps.repositories;

  const createOne = createCreateOneMusicVersionUseCase({
    saveOneMusicVersionFn: musicVersionRepository.saveOne,
  })


  return {
    createOne,
  };
}