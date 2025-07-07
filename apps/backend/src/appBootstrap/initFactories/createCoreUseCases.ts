import { createAuthUseCases } from './initUsesCases/createAuthUseCases.js';
import { createMusicRepertoireUseCases } from './initUsesCases/createMusicRepertoireUseCases.js';
import type { TCoreRepositories } from './createCoreRepositories.js';
import type { TAuthUseCases } from '../../auth/types/auth.core.useCase.js';
import type { TMusicRepertoireUseCases } from '../../music/types/musicRepertoire.useCases.types.js';
import type { TCoreServices } from './createCoreServices.js';
import type { MongoClient } from 'mongodb';
import type { TMusicReferencesUseCases } from './initUsesCases/createMusicReferencesUseCases.js';
import { createMusicReferencesUseCases } from './initUsesCases/createMusicReferencesUseCases.js';

export type TCoreUseCases = {
  auth: TAuthUseCases;
  musicReferences: TMusicReferencesUseCases;
  musicVersions: any;
  musicRepertoireEntries: TMusicRepertoireUseCases;
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
      musicReferences: createMusicReferencesUseCases(deps),
      musicVersions: {},
      musicRepertoireEntries: createMusicRepertoireUseCases(deps),

    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error initializing use cases: ${err}`);
    }
    throw new Error(`Error initializing use cases: ${err}`);
  }
};
