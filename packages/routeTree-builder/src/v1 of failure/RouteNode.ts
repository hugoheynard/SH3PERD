import type {IRouteConfig, RouterFactory } from "./types";

export class RouteNode {
    public path: string;
    public factory: RouterFactory;
    public config: IRouteConfig = {};
    public children: RouteNode[] = [];

    constructor(input: {
        path: string;
        factory: RouterFactory;
        config?: IRouteConfig;
    }) {
        this.path = input.path;
        this.factory = input.factory;
        this.config = input.config || {};
    }

    addChild(input: { node: RouteNode }): void {
        this.children.push(input.node);
    };
}