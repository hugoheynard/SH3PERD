import type { TGetMusicRepertoireByFilterRequestDTO, TGetMusicRepertoireByFilterResponseDTO } from '@sh3pherd/shared-types';


export type TMusicRepertoireUseCases = {
  createEntry: any;
  getEntriesBy: TGetMusicRepertoireByUseCase;
};

export type TGetMusicRepertoireByUseCase = (requestDTO:TGetMusicRepertoireByFilterRequestDTO) => Promise<TGetMusicRepertoireByFilterResponseDTO>;
