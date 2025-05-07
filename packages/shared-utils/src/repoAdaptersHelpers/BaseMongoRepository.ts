import type {ClientSession, Collection, Document, Filter, MongoClient, WithId} from "mongodb";
import type {TBaseMongoRepoDeps} from "@sh3pherd/shared-types";


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
    protected mapMongoDocToDomainModel(input: {
        doc: WithId<TDomainModel>;
    }): TDomainModel {
        const { _id, ...rest } = input.doc;
        return rest as unknown as TDomainModel;
    };

    /**
     * Generic find method that can be reused by specific child implementations.
     */
    protected async findDocBy(filter: Filter<TDomainModel>): Promise <TDomainModel | null> {
        const result = await this.collection.findOne(filter);

        if (!result) {
            return null;
        }

        return this.mapMongoDocToDomainModel({ doc: result });
    };

    protected async findOneAndUpdateDoc(input: {
        filter: Filter<TDomainModel>,
        update: Partial<TDomainModel>,
        options?: {
            projection?: Record<string, 0 | 1>;
            session?: ClientSession;
        }
    }): Promise<TDomainModel | null> {
        const { filter, update, options } = input;

        const result = await this.collection.findOneAndUpdate(
            filter,
            {$set: update},
            {
                returnDocument: 'after',
                projection: options?.projection ?? {_id: 0},
                session: options?.session,
            }
        );

        return result ? this.mapMongoDocToDomainModel({ doc: result }) : null;
    };

    protected startSession(): ClientSession {
        return this.client.startSession();
    }
}
