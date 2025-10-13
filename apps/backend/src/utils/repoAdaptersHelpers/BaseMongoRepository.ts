import type {
  ClientSession,
  Collection,
  Document,
  Filter,
  FindOptions,
  MongoClient,
  OptionalUnlessRequiredId,
  WithId,
} from 'mongodb';
import type { TBaseMongoRepoDeps } from '../../types/mongo/mongo.types.js';
import type { IBaseCRUD, TUpdateOneMongoFn } from './repository.genericFunctions.types.js';

export abstract class BaseMongoRepository<TRecord extends Document> implements IBaseCRUD<TRecord> {
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
  async findOne(filter: Filter<TRecord>): Promise<TRecord | null> {
    const result = await this.collection.findOne(filter);
    return result ? this.mapMongoDocToDomainModel(result): null;
  };

  async findMany(filter: Filter<TRecord>, options?: FindOptions): Promise<TRecord[] | null> {
    const results = await this.collection.find(
      filter,
      {
        ...options,
        projection: { ...(options?.projection ?? {}), _id: 0 }
      }
    ).toArray();

    return results.length > 0 ? results.map(r => this.mapMongoDocToDomainModel(r)) : null;
  };

  /**
   * Generic update method that can be reused by specific child implementations.
   * @param input
   */
  async updateOne(input: Parameters<TUpdateOneMongoFn<TRecord>>[0]): ReturnType<TUpdateOneMongoFn<TRecord>> {
    const { filter, update, options } = input;

    const result = await this.collection.findOneAndUpdate(filter, update, {
      ...options,
      projection: { ...(options?.projection ?? {}), _id: 0 },
      returnDocument: 'after',
    });

    return result ? result['value'] : null;
  };

  /**
   * Generic create method that can be reused by specific child implementations.
   */
  async save(docOrDocs: OptionalUnlessRequiredId<TRecord> | OptionalUnlessRequiredId<TRecord>[]): Promise<boolean> {
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
