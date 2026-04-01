import { type TContractsUseCases } from '../../contracts/useCase/ContractUseCasesFactory.js';

/**
 * Legacy use-case registry.
 * Music and auth have been migrated to CQRS handlers (CommandBus/QueryBus).
 * Remaining domains (contracts) still use this factory pattern.
 */
export type TCoreUseCases = {
  user?: any;
  contracts?: TContractsUseCases;
};

export const createCoreUseCases = (): TCoreUseCases => {
  try {
    return {};
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error initializing use cases: ${err}`);
    }
    throw new Error(`Error initializing use cases: ${err}`);
  }
};
