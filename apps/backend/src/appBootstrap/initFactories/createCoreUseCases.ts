import {createAuthUseCases} from "./initUsesCases/createAuthUseCases.js";
import {createMusicRepertoireUseCases} from "./initUsesCases/createMusicRepertoireUseCases.js";
import type { TCoreRepositories } from './createCoreRepositories.js';
import type { TAuthUseCases } from '../../auth/types/auth.core.useCase.js';
import type { TMusicRepertoireUseCases } from '../../music/types/musicRepertoire.useCases.types.js';

export type TCoreUseCases = {
  auth: TAuthUseCases,
  musicRepertoire: TMusicRepertoireUseCases
}

/**
 * Creates core use cases for the application.
 * @param deps
 */
export const createCoreUseCases = (deps: { services: any; repositories: TCoreRepositories }): TCoreUseCases => {

  try {
      return {
          auth: createAuthUseCases(deps),
          musicRepertoire: createMusicRepertoireUseCases(deps)
      };
  } catch (err) {
      throw new Error(`Error initializing use cases: ${err}`);
  }
};