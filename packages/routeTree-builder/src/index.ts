import {RouterBuilder} from "./RouterBuilder";
import {validateRouteDef} from "./utils/validateRouteDef";
import {createContext} from "./utils/createContext";
import {createRouterFromFactory} from "./utils/createRouterFromFactory";
import {mountRoute} from "./utils/mountRoute";


export const routerBuilder = new RouterBuilder({
    validateRouteDefFunction: validateRouteDef,
    createContextFunction: createContext,
    createRouterFromFactoryFunction: createRouterFromFactory,
    mountRouteFunction: mountRoute
});

export {injectAsyncMiddleware as injectAsyncMiddleware} from "./utils/injectAsyncMiddleware";