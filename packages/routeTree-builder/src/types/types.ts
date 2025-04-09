import type {RequestHandler} from "express";

export type RouteFactoryContext = Record<string, unknown>;
export type MiddlewareFactory = (ctx: RouteFactoryContext) => RequestHandler;


type SimpleMiddleware = RequestHandler;

type MiddlewareWithDeps<TDeps = Record<string, any>> = {
    mw: (deps: TDeps) => RequestHandler | Promise<RequestHandler>;
    async?: boolean;
    withDeps: true;
    deps: TDeps;
};

export type MiddlewareEntry = SimpleMiddleware | MiddlewareWithDeps;

export type ResolveMiddlewaresFunction = (input: {
    middlewares: MiddlewareEntry[];
    name?: string;
}) => Promise<RequestHandler[]>;