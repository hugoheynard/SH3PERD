import type { TCoreRepositories } from '../../initFactories/createCoreRepositories.js';

export function createRepositoryContainer() {
  let repositories: TCoreRepositories | null = null;

  return {
    set(repos: TCoreRepositories) {
      repositories = repos;
    },
    get<K extends keyof TCoreRepositories>(name: K): TCoreRepositories[K] {
      if (!repositories) {
        throw new Error('Repositories not initialized');
      }
      return repositories[name];
    },
  };
}


export const RepositoryContainer = createRepositoryContainer();