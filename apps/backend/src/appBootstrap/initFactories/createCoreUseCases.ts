import type { TAuthUseCases } from '../../auth/types/auth.core.useCase.js';
import type { TMusicRepertoireUseCases } from '../../music/types/musicRepertoire.useCases.types.js';
import type { TMusicReferencesUseCases } from '../../music/useCases/references/createMusicReferencesUseCases.js';
import {  type TMusicVersionsUseCases } from '../../music/useCases/versions/createMusicVersionsUseCases.js';
import {  type TMusicLibraryUseCases } from '../../music/useCases/library/MusicLibraryUseCasesFactory.js';
import { type TContractsUseCases } from '../../contracts/useCase/ContractUseCasesFactory.js';


export type TCoreUseCases = {
  auth?: TAuthUseCases;
  user?: any;
  contracts?: TContractsUseCases;
  musicReferences?: TMusicReferencesUseCases;
  musicVersions?: TMusicVersionsUseCases;
  musicRepertoireEntries?: TMusicRepertoireUseCases;
  musicLibrary?: TMusicLibraryUseCases;
};

/**
 * Creates core use cases for the application.

 */
export const createCoreUseCases = (
): TCoreUseCases => {
  try {
    return {};
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error initializing use cases: ${err}`);
    }
    throw new Error(`Error initializing use cases: ${err}`);
  }
};
