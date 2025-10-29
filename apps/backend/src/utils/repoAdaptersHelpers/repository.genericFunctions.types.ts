import type { ClientSession, Filter, FindOneAndUpdateOptions, OptionalUnlessRequiredId, UpdateFilter } from 'mongodb';

/*
 * Type definition for CRUD functions using Mongo.
 */
export type TGenericSaveFn<TRecord> = (docOrDocs: TRecord | TRecord[]) => Promise<boolean>;

export type TGenericRepoFindOneFn<TRecord> = (filter: Partial<TRecord> | Filter<TRecord>) => Promise<TRecord | null>;

/**
 * Type definition for a generic repository update function.
 * @param T - The type of the record being updated.
 * @returns A promise that resolves to the updated record or null.
 */
export type TGenericRepoUpdateOneFn<TRecord> = (input: { filter: Partial<TRecord> | Filter<TRecord>, update: Partial<TRecord> | UpdateFilter<TRecord> }) => Promise<TRecord | null>;

export type TSaveMongoFn<TRecord> = (docOrDocs: OptionalUnlessRequiredId<TRecord> | OptionalUnlessRequiredId<TRecord>[], session?: ClientSession) => Promise<boolean>;
export type TFindOneMongoFn<TRecord> = (input: { filter: Filter<TRecord> }) => Promise<TRecord | null>;
export type TFindManyMongoFn<TRecord> = (input: { filter: Filter<TRecord> }) => Promise<TRecord[] | null>;
export type TUpdateOneMongoFn<TRecord> = (input: { filter: Filter<TRecord>; update: UpdateFilter<TRecord>; options?: FindOneAndUpdateOptions; }) => Promise<TRecord | null>;
export type TDeleteOneMongoFn<TRecord> = (filter: Filter<TRecord>) => Promise<boolean>;
export type TDeleteManyMongoFn<TRecord> = (filter: Filter<TRecord>) => Promise<boolean>;

/**
 * Base interface for CRUD operations.
 */
export interface IBaseCRUD<TRecord> {
  save: TSaveMongoFn<TRecord> | TGenericSaveFn<TRecord>;
  findOne: TFindOneMongoFn<TRecord> | TGenericRepoFindOneFn<TRecord>;
  findMany: TFindManyMongoFn<TRecord>;
  updateOne: TUpdateOneMongoFn<TRecord> | TGenericRepoUpdateOneFn<TRecord>;
  //updateMany: any;
  deleteOne: TDeleteOneMongoFn<TRecord>;
  deleteMany: TDeleteManyMongoFn<TRecord>;

  startSession: ()=> ClientSession;
}

