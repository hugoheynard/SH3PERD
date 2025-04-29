import type {ObjectId} from "mongodb";

/**
 * Base class for all Mongo Repositories.
 * Provides utility to map MongoDB documents to domain models.
 */
export abstract class BaseMongoRepository {
    protected mapMongoDocToDomainModel<T>(input: { doc: T & { _id?: ObjectId } }): T {
        const { _id, ...rest } = input.doc;
        return rest as T;
    };
}