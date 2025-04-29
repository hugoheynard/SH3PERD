import type {RequestHandler, Router} from 'express';
import type {DeclarativeFactoryResult} from "./TRouteDef.js";

export type THttpMethod =
    | 'get' | 'post' | 'put'
    | 'patch' | 'delete'
    | 'options' | 'head';

export type MethodAndPath = `${THttpMethod}:${string}`;

export type TObjectRoute = {
    handler?: RequestHandler | RequestHandler[];
    mw?: TMiddlewareEntry[];
};

export type TDeclarativeRoute =
    | RequestHandler
    | RequestHandler[]
    | TObjectRoute;



export type RouteFactoryContext = Record<string, unknown>;

export type MiddlewareFactory<TDeps = any> = (deps: TDeps) => RequestHandler | Promise<RequestHandler>;

export type SimpleMiddleware = RequestHandler;

export type MiddlewareWithDeps<TDeps = any> = {
    factory: MiddlewareFactory<TDeps>;
    async?: boolean;
    deps: TDeps | (() => Promise<TDeps>);
};

export type TMiddlewareEntry = SimpleMiddleware | MiddlewareWithDeps;

export type ResolveMiddlewaresFunction = (input: {
    middlewares: TMiddlewareEntry[];
    name?: string;
}) => Promise<RequestHandler[]>;




export interface IAbstractMiddlewareResolver {
    setContext(context: RouteFactoryContext): void;
    resolveAll(entries: TMiddlewareEntry[]): Promise<RequestHandler[]>
}

export type RouteMap = Partial<Record<MethodAndPath, RequestHandler | RequestHandler[]>>;


/**
 * Represents a declarative route definition in the application tree.
 * Each RouteDef maps to one Express Router instance.
 */
export type RouteDef<TDeps extends Record<string, unknown> = Record<string, unknown>> = {
    path: `/${string}`;
    factory?: (context: RouteFactoryContext) => Promise<Router | DeclarativeFactoryResult>;
    routes?: RouteMap;
    mw?: TMiddlewareEntry[];
    inject?: TDeps;
    middlewares?: TMiddlewareEntry[];
    children?: RouteDef[];
};