import { ObjectId } from 'mongodb';

/**
 * Utility to strip Mongo `_id` from a raw document and cast to domain type.
 *
 * @returns The document cast as a domain entity without `_id`
 * @param input
 */
export const mapMongoDocToDomainModel = <T>(
    input: { document: T & { _id: ObjectId | undefined } }
): T => {
    const { _id, ...rest } = input.document;
    return rest as T
};
