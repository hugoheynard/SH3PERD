import {RouterBuilder} from "./RouterBuilder/RouterBuilder.js";
import {validateRouteDef} from "./utils/validateRouteDef.js";
import {createContext} from "./utils/createContext.js";
import {createRouterFromFactory} from "./utils/fnOld/createRouterFromFactory.js";
import {resolveMiddlewares} from "./utils/fnOld/resolveMiddlewares.js";
import {createRouterFromMap} from "./utils/declarative/createRouterFromMap.js";



export const routerBuilder = new RouterBuilder({
    validateRouteDefFunction: validateRouteDef,
    createContextFunction: createContext,
    createRouterFromFactoryFunction: createRouterFromFactory,
    createRouterFromMapFunction: createRouterFromMap,
    resolveMiddlewaresFunction: resolveMiddlewares
});

