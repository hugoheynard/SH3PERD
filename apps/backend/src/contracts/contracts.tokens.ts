/**
 * Namespace for contract module injection tokens.
 * Use-case tokens have been removed — the module now uses CQRS (CommandBus/QueryBus).
 */
export const CONTRACT_TOKENS = {
  /** Contract record repository */
  CONTRACT_REPOSITORY: Symbol('CONTRACT_REPOSITORY'),
} as const;
