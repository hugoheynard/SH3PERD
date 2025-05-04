import type {Collection, Filter, Document, WithId} from "mongodb";


export abstract class BaseMongoRepository<TDomainModel extends Document> {
    protected readonly collection: Collection<TDomainModel>;

    protected constructor(collection: Collection<TDomainModel>) {
        this.collection = collection;
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
}
