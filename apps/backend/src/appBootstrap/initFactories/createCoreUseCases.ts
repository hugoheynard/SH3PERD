import { createAuthUseCases } from './initUsesCases/createAuthUseCases.js';
import { createMusicRepertoireUseCases } from './initUsesCases/createMusicRepertoireUseCases.js';
import type { TCoreRepositories } from './createCoreRepositories.js';
import type { TAuthUseCases } from '../../auth/types/auth.core.useCase.js';
import type { TMusicRepertoireUseCases } from '../../music/types/musicRepertoire.useCases.types.js';
import type { TCoreServices } from './createCoreServices.js';
import type { MongoClient } from 'mongodb';
import type { TMusicReferencesUseCases } from './initUsesCases/createMusicReferencesUseCases.js';
import { createMusicReferencesUseCases } from './initUsesCases/createMusicReferencesUseCases.js';
import { createMusicVersionsUseCases, type TMusicVersionsUseCases } from './initUsesCases/createMusicVersionsUseCases.js';
import { createMusicLibraryUseCases, type TMusicLibraryUseCases } from './initUsesCases/createMusicLibraryUseCases.js';
import { createUserUseCases, type TUserUseCases } from '../../user/useCases/createUserUseCases.js';
import { contractUseCasesFactory, type TContractsUseCases } from '../../contracts/useCase/contractUseCasesFactory.js';

export type TCoreUseCases = {
  auth: TAuthUseCases;
  user: TUserUseCases;
  contracts: TContractsUseCases;
  musicReferences: TMusicReferencesUseCases;
  musicVersions: TMusicVersionsUseCases;
  musicRepertoireEntries: TMusicRepertoireUseCases;
  musicLibrary: TMusicLibraryUseCases;
};

/**
 * Creates core use cases for the application.
 * @param deps
 */
export const createCoreUseCases = (deps: {
  services: TCoreServices;
  repositories: TCoreRepositories;
  tools?: any;
  mongoClient?: MongoClient;
}): TCoreUseCases => {
  try {
    return {
      auth: createAuthUseCases(deps),
      user: createUserUseCases(deps),
      contracts: contractUseCasesFactory(deps),
      musicReferences: createMusicReferencesUseCases(deps),
      musicVersions: createMusicVersionsUseCases(deps),
      musicRepertoireEntries: createMusicRepertoireUseCases(deps),
      musicLibrary: createMusicLibraryUseCases(deps),

    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error initializing use cases: ${err}`);
    }
    throw new Error(`Error initializing use cases: ${err}`);
  }
};
