import {createAuthUseCases} from "./initUsesCases/createAuthUseCases.js";


export const initUseCases = (deps: { services: any; repositories: any }): any => {

  try {
      return {
          auth: createAuthUseCases(deps),
      };
  } catch (err) {
      throw new Error(`Error initializing use cases: ${err}`);
  }
};