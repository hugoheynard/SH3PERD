import type {ObjectId} from "mongodb";


export type TmapMongoDocToDomainModelFunction = <T>(input: { document: T & { _id: ObjectId } }) => T;

export interface IMongoRepoWithDocMapper {
    mapMongoDocToDomainModelFn: TmapMongoDocToDomainModelFunction;
}