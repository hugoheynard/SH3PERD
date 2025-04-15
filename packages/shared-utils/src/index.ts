// Entry point for @sh3pherd/shared-utils

//repoAdaptersHelpers



export { assertRequiredKeys as assertRequiredKeys } from './assert/assertRequiredKeys';

export { mapMongoDocToDomainModel as mapMongoDocToDomainModel } from './repoAdaptersHelpers/mapMongoDocToDomainModel';
export type { TmapMongoDocToDomainModelFunction as TmapMongoDocToDomainModelFunction } from './repoAdaptersHelpers/IMongoRepoWithDocMapper';
export type { IMongoRepoWithDocMapper as IMongoRepoWithDocMapper } from './repoAdaptersHelpers/IMongoRepoWithDocMapper';

export type { MiddlewareFn as MiddlewareFn } from './types/types';
export { generateTypedId as generateTypedId} from './ids/generateTypedId';
export { wrapServiceWithTryCatch as wrapServiceWithTryCatch } from "./errorManagement/tryCatch/tryCatchServiceWrapper";
export {wrap_tryCatchNextErr as wrap_tryCatchNextErr} from "./errorManagement/tryCatch/wrap_tryCatchNextErr";

export { notFound_404_Handler as notFound_404_Handler } from './errorManagement/middlewares/notFound_404_Handler';
export { errorCatcherMw_simple as errorCatcherMw_simple } from './errorManagement/middlewares/errorCatcherMw_simple';
export {withErrorHandler as withErrorHandler} from "./errorManagement/tryCatch/withErrorHandler";
export {dateIsPassed} from "./date/dateIsPassed";
