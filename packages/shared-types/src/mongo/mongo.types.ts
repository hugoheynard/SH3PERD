import type { Filter } from 'mongodb';

/**
 * A generic function signature for finding a document by a flexible filter.
 *
 * @template TDomainModel - The shape of the domain model
 */
export type TFindDocByFn<TDomainModel> = (filter: Filter<TDomainModel>) => Promise<TDomainModel | null>;