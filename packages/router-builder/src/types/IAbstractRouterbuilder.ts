import type {RouteDef} from "./TRouteDef";
import type {Router} from "express";
import type {ResolveMiddlewaresFunction, RouteFactoryContext} from "./types";

export interface IAbstractRouterBuilder {
    build: (input: { routeDefs: RouteDef[] }) => Promise<Router>
}

export type TRouterBuilderDependencies = {
    validateRouteDefFunction: (input: { routeDef: RouteDef }) => void;
    createContextFunction: (input: { routeDef: RouteDef }) => RouteFactoryContext;
    createRouterFromFactoryFunction: (input: { routeDef: RouteDef, routeContext: RouteFactoryContext })=> Router;
    resolveMiddlewaresFunction: ResolveMiddlewaresFunction;
}

