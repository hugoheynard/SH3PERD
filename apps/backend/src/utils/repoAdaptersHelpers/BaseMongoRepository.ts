import type {
  ClientSession,
  Collection,
  Document,
  Filter,
  FindOneAndUpdateOptions,
  MongoClient, OptionalUnlessRequiredId,
  UpdateFilter,
  WithId,
} from 'mongodb';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';

/**
 * Type definition for a function that finds multiple documents by a filter.
 */
export type TFindManyDocsByFilterFn<T> = (filter: Filter<T>) => Promise<T[] | null>;

export interface IBaseCRUD<TRecord> {
  create: (docOrDocs: OptionalUnlessRequiredId<TRecord> | OptionalUnlessRequiredId<TRecord>[]) => Promise<boolean>;
  findOneDocBy: (filter: Filter<TRecord>) => Promise<TRecord | null>;
  findManyDocsBy: TFindManyDocsByFilterFn<TRecord>;
  deleteOne: (filter: Filter<TRecord>) => Promise<boolean>;
  deleteMany: (filter: Filter<TRecord>) => Promise<boolean>;
}

export abstract class BaseMongoRepository<TRecord extends Document>
  implements IBaseCRUD<TRecord> {

  protected readonly client: MongoClient;
  protected readonly collection: Collection<TRecord>;

  protected constructor(protected readonly input: TBaseMongoRepoDeps) {
    this.client = input.client;
    this.collection = this.client.db(input.dbName).collection<TRecord>(input.collectionName);
  };

  //--------- CRUD HELPERS ---------
  /**
   * Generic find method that can be reused by specific child implementations.
   */
  async findOneDocBy(filter: Filter<TRecord>): Promise<TRecord | null> {
    const result = await this.collection.findOne(filter);

    if (!result) {
      return null;
    }

    return this.mapMongoDocToDomainModel(result);
  };

  async findManyDocsBy(filter: Filter<TRecord>): Promise<TRecord[] | null> {
    const results = await this.collection.find(filter).toArray();

    if (!results || results.length === 0) {
      return null;
    }

    return results.map(this.mapMongoDocToDomainModel);
  };

  /**
   * Generic update method that can be reused by specific child implementations.
   * @param input
   */
  async findOneAndUpdateDoc(input: {
    filter: Filter<TRecord>;
    update: UpdateFilter<TRecord>;
    options?: FindOneAndUpdateOptions;
  }): Promise<TRecord | null> {
    const { filter, update, options } = input;

    const result = await this.collection.findOneAndUpdate(filter, update, {
      projection: options?.projection ?? { _id: 0 },
      returnDocument: 'after',
      ...options,
    });

    return result ? this.mapMongoDocToDomainModel(result) : null;
  };

  /**
   * Generic create method that can be reused by specific child implementations.
   */
  async create(docOrDocs: OptionalUnlessRequiredId<TRecord> | OptionalUnlessRequiredId<TRecord>[]): Promise<boolean> {
    if (!Array.isArray(docOrDocs)) {
      const result = await this.collection.insertOne(docOrDocs);
      return result.acknowledged && !!result.insertedId;
    }
    const result = await this.collection.insertMany(docOrDocs);
    return result.acknowledged && result.insertedCount === docOrDocs.length;
  };

  /**
   * Generic delete method that can be reused by specific child implementations.
   * @param filter
   */
  async deleteMany(filter: Filter<TRecord>): Promise<boolean> {
    const result = await this.collection.deleteMany(filter);
    return result.acknowledged && (result.deletedCount ?? 0) > 0;
  };

  async deleteOne(filter: Filter<TRecord>): Promise<boolean> {
    const result = await this.collection.deleteOne(filter);
    return result.acknowledged && result.deletedCount === 1;
  };


  //--------- TRANSACTION HELPERS ---------
  /**
   * Starts a new MongoDB client session.
   * @protected
   */
  protected startSession(): ClientSession {
    return this.client.startSession();
  };

  //--------- MAPPING HELPERS ---------
  /**
   * Maps a MongoDB document (WithId<T>) to a domain model by stripping _id
   */
  protected mapMongoDocToDomainModel(doc: WithId<TRecord>): TRecord {
    const { _id: _, ...rest } = doc;
    return rest as unknown as TRecord;
  };
}
