import type { TAuthUseCases } from '../../auth/types/auth.core.useCase.js';
import { type TContractsUseCases } from '../../contracts/useCase/ContractUseCasesFactory.js';


/**
 * Legacy use-case registry.
 * Music use cases have been migrated to CQRS handlers (CommandBus/QueryBus).
 * Remaining domains (auth, contracts) still use this factory pattern.
 */
export type TCoreUseCases = {
  auth?: TAuthUseCases;
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
