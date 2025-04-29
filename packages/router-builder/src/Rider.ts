import {type HookCallback, RouterLifecycleHooks} from "./core/RouterBuilder/RouterLifecycleHooks.js";
import {type RequestHandler, Router} from "express";
import type {RouteDef} from "./types/types.js";
import {HookableRouterBuilder} from "./core/RouterBuilder/HookableRouterBuilder.js";
import {defineModule} from "./infra/defineModule.js";
import type {TModuleInput} from "./core/defineModule/defineModuleFactory.js";


export class Rider {
    //Router Injection & Dynamic Expandable Routes

    private lifecycle = new RouterLifecycleHooks();
    //private middlewares: RequestHandler[] = [];


    // ✅ Builder
    async build(input: { routeDefs: RouteDef[] }): Promise<Router> {
        const builder = new HookableRouterBuilder(this.lifecycle/*, this.middlewares*/);
        return await builder.build(input);
    };

    static def<TDeps extends Record<string, unknown>>(input: TModuleInput<TDeps>): RouteDef<TDeps> {
        return defineModule<TDeps>(input);
    };

    /*
    useGlobalMiddleware(mw: RequestHandler): this {
        this.middlewares.push(mw);
        return this;
    };
     */

    // ✅ hook exposure
    useBeforeValidate(hook: HookCallback | HookCallback[]): this {
        this.lifecycle.useBeforeValidate(hook);
        return this;
    };

    useBeforeRegister(hook: HookCallback | HookCallback[]): this {
        this.lifecycle.useBeforeRegister(hook);
        return this;
    };

    useBeforeChildren(hook: HookCallback | HookCallback[]): this {
        this.lifecycle.useBeforeChildren(hook);
        return this;
    };

    useBeforeMount(hook: HookCallback | HookCallback[]): this {
        this.lifecycle.useBeforeMount(hook);
        return this;
    };
}
