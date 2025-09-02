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

export abstract class BaseMongoRepository<TDomainModel extends Document> {
  protected readonly client: MongoClient;
  protected readonly collection: Collection<TDomainModel>;

  protected constructor(protected readonly input: TBaseMongoRepoDeps) {
    this.client = input.client;
    this.collection = this.client.db(input.dbName).collection<TDomainModel>(input.collectionName);
  }

  /**
   * Maps a MongoDB document (WithId<T>) to a domain model by stripping _id
   */
  protected mapMongoDocToDomainModel(doc: WithId<TDomainModel>): TDomainModel {
    const { _id: _, ...rest } = doc;
    return rest as unknown as TDomainModel;
  }

  /**
   * Generic find method that can be reused by specific child implementations.
   */
  protected async findDocBy(filter: Filter<TDomainModel>): Promise<TDomainModel | null> {
    const result = await this.collection.findOne(filter);

    if (!result) {
      return null;
    }

    return this.mapMongoDocToDomainModel(result);
  }

  protected async findOneAndUpdateDoc(input: {
    filter: Filter<TDomainModel>;
    update: UpdateFilter<TDomainModel>;
    options?: FindOneAndUpdateOptions;
  }): Promise<TDomainModel | null> {
    const { filter, update, options } = input;

    const result = await this.collection.findOneAndUpdate(filter, update, {
      projection: options?.projection ?? { _id: 0 },
      ...options,
    });

    return result ? this.mapMongoDocToDomainModel(result) : null;
  };

  protected async saveDoc(doc: OptionalUnlessRequiredId<TDomainModel>): Promise<boolean> {
    const result = await this.collection.insertOne(doc);

    if (!result.acknowledged || !result.insertedId) {
      return false;
    }
    return true;
  };

  /**
   * Starts a new MongoDB client session.
   * @protected
   */
  protected startSession(): ClientSession {
    return this.client.startSession();
  }
}
