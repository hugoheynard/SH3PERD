import {RouterBuilder} from "./RouterBuilder";
import {validateRouteDef} from "./utils/validateRouteDef";
import {createContext} from "./utils/createContext";
import {createRouterFromFactory} from "./utils/createRouterFromFactory";
import {resolveMiddlewares} from "./utils/resolveMiddlewares";



export const routerBuilder = new RouterBuilder({
    validateRouteDefFunction: validateRouteDef,
    createContextFunction: createContext,
    createRouterFromFactoryFunction: createRouterFromFactory,
    resolveMiddlewaresFunction: resolveMiddlewares
});
