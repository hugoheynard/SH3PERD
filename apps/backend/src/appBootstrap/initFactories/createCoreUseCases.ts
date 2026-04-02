/**
 * Legacy use-case registry.
 * All domains have been migrated to CQRS handlers (CommandBus/QueryBus).
 * This file is kept for backward compatibility but is effectively empty.
 */
export type TCoreUseCases = Record<string, never>;

export const createCoreUseCases = (): TCoreUseCases => {
  return {};
};
