import { Router } from 'express';
import type {RouteTree} from "./RouteTree";

export type Middleware = (req: any, res: any, next: any) => void | Promise<void>



export type RouteFactoryContext = Record<string, any>;

export type RouterFactory = (ctx: RouteFactoryContext) => Router;

export interface IRouteConfig {
    middlewares?: Middleware[];
    inject?: Partial<RouteFactoryContext>;
}

export interface UseRouteParams {
    path: string;
    factory: RouterFactory;
    config?: IRouteConfig;
    nested?: (builder: RouteTree) => void;
}