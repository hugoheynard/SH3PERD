import {createAuthUseCases} from "./initUsesCases/createAuthUseCases.js";
import {createMusicRepertoireUseCases} from "./initUsesCases/createMusicRepertoireUseCases.js";


export const initUseCases = (deps: { services: any; repositories: any }): any => {

  try {
      return {
          auth: createAuthUseCases(deps),
          musicRepertoire: createMusicRepertoireUseCases(deps)
      };
  } catch (err) {
      throw new Error(`Error initializing use cases: ${err}`);
  }
};