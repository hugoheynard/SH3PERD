import {RouteTree} from "./RouteTree";
import type {Router} from "express";

export class RouteBuilder {
    private routeTree: any;

    //methods :
    createRoute(input: { path: `/${string}`; fromFactory: RouterFactory }): void {
        if (this.route) {
            throw new Error('Route already created: only one route per RouteBuilder instance');
        }

        const { path, fromFactory } = input;

        if (!path.startsWith('/')) {
            throw new Error('Route path must start with "/"');
        }

        if (!fromFactory || typeof fromFactory !== 'function') {
            throw new Error('Route factory is required and must be a function');
        }

        this.route = {
            path,
            factory: fromFactory,
            config: {}
        };
    }

    addMiddleware(middleware: any): void {

    };
}