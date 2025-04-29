import type {RouteMap, TMiddlewareEntry} from './types.js';


export type DeclarativeFactoryResult = {
    mw?: TMiddlewareEntry[];
    routes: RouteMap;
};

