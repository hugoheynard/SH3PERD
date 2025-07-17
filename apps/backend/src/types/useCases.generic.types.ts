import type { TCoreServices } from '../appBootstrap/initFactories/createCoreServices.js';
import type { TCoreRepositories } from '../appBootstrap/initFactories/createCoreRepositories.js';


export type TUseCasesFactoryGeneric<T> = (deps: {
  services: TCoreServices;
  repositories: TCoreRepositories;
}) => T;