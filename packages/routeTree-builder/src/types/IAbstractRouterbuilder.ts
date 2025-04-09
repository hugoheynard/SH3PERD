import type {RouteDef} from "./TRouteDef";
import type {Router} from "express";
import type {RouteFactoryContext} from "./types";

export interface IAbstractRouterBuilder {
    build: (input: { routeDefs: RouteDef[] }) => Router;
}

export type TRouterBuilderDependencies = {
    validateRouteDefFunction: (input: { routeDef: RouteDef }) => void;
    createContextFunction: (input: { routeDef: RouteDef }) => RouteFactoryContext;
    createRouterFromFactoryFunction: (input: { routeDef: RouteDef, routeContext: RouteFactoryContext })=> Router;
}

