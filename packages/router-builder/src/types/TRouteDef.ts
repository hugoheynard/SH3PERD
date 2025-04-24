import type {TMiddlewareEntry} from './types.js';
import type {RouteMap} from './defineRoutes.js';

export type DeclarativeFactoryResult = {
    mw?: TMiddlewareEntry[];
    routes: RouteMap;
};

