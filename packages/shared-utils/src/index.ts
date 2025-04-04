// Entry point for @sh3pherd/shared-utils

//repoAdaptersHelpers
export { mapMongoDocToDomainModel as mapMongoDocToDomainModel } from './repoAdaptersHelpers/mapMongoDocToDomainModel';
export type { TmapMongoDocToDomainModelFunction as TmapMongoDocToDomainModelFunction } from './repoAdaptersHelpers/IMongoRepoWithDocMapper';
export type { IMongoRepoWithDocMapper as IMongoRepoWithDocMapper } from './repoAdaptersHelpers/IMongoRepoWithDocMapper';

export { MiddlewareFn as MiddlewareFn } from './types/types';
export { generateTypedId as generateTypedId} from './ids/generateTypedId';
export { wrap_tryCatchNextErr as wrap_tryCatchNextErr} from './tryCatch/wrap_tryCatchNextErr';
export { wrapServiceWithTryCatch as wrapServiceWithTryCatch } from './tryCatch/tryCatchServiceWrapper';

export { notFound_404_Handler as notFound_404_Handler } from './errorManagement/middlewares/notFound_404_Handler';
export { errorCatcherMw_simple as errorCatcherMw_simple } from './errorManagement/middlewares/errorCatcherMw_simple';