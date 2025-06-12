import {createAuthUseCases} from "./initUsesCases/createAuthUseCases.js";
import {createMusicRepertoireUseCases} from "./initUsesCases/createMusicRepertoireUseCases.js";
import type { TCoreRepositories } from '../repositories/createCoreRepositories.js';


export const createCoreUseCases = (deps: { services: any; repositories: TCoreRepositories }): any => {

  try {
      return {
          auth: createAuthUseCases(deps),
          musicRepertoire: createMusicRepertoireUseCases(deps)
      };
  } catch (err) {
      throw new Error(`Error initializing use cases: ${err}`);
  }
};