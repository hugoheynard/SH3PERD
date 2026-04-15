import type { TContractId, TUserId } from '@sh3pherd/shared-types';

/**
 * Context information for use cases, including the ID of the user making the request
 * and an optional contract scope.
 */
export type TUseCaseContext<Mode extends 'scoped' | 'unscoped' = 'unscoped'> = Mode extends 'scoped'
  ? { user_scope: TUserId; contract_scope: TContractId }
  : { user_scope: TUserId };

export type Exact<TExpected, TActual extends TExpected> = TActual extends TExpected
  ? Exclude<keyof TActual, keyof TExpected> extends never
    ? TActual
    : never
  : never;

/**
 * Generic input type for use cases, including context and request data.
 * @template TDTO - The type of the request data transfer object.
 * @template Mode - The mode of the use case context, either 'scoped' or 'unscoped'.
 */
export type TUseCaseInput<TDTO, Mode extends 'scoped' | 'unscoped' = 'unscoped'> = {
  context: Exact<
    TUseCaseContext<Mode>,
    Mode extends 'scoped'
      ? { user_scope: TUserId; contract_scope: TContractId }
      : { user_scope: TUserId }
  >;
  requestDTO: TDTO;
};
