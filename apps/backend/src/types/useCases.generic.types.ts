import type { TCoreServices } from '../appBootstrap/initFactories/createCoreServices.js';

import type { TCoreRepositories } from '../appBootstrap/database/CoreRepositoriesModule.js';

/**
 * A generic factory type for creating use cases with dependencies on core services and repositories.
 * @template T - The type of use cases to be created.
 * @param deps - An object containing core services and repositories.
 * @returns An instance of the specified use cases type.
 */
export type TUseCasesFactoryGeneric<T> = (deps: {
  services: TCoreServices;
  repositories: TCoreRepositories;
}) => T;

