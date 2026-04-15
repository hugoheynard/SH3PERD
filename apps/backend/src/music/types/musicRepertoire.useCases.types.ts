import type {
  TGetMusicRepertoireByFilterRequestDTO,
  TGetMusicRepertoireByFilterResponseDTO,
  TCreateRepertoireEntryPayload,
  TMusicRepertoireEntryDomainModel,
} from '@sh3pherd/shared-types';

export type TMusicRepertoireUseCases = {
  createEntry: TCreateMusicRepertoireUseCase;
  getEntriesBy: TGetMusicRepertoireByUseCase;
};

export type TCreateMusicRepertoireUseCase = (
  requestDTO: TCreateRepertoireEntryPayload,
) => Promise<TMusicRepertoireEntryDomainModel>;

export type TGetMusicRepertoireByUseCase = (
  requestDTO: TGetMusicRepertoireByFilterRequestDTO,
) => Promise<TGetMusicRepertoireByFilterResponseDTO>;
