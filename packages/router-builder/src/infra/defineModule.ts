import {normalizeRouteMapFactory} from "../core/routeNormalizer/normalizeRouteMapFactory.js";
import {
    isHandler,
    isHandlerArray,
    isObjectRoute,
    splitMethodPath
} from "../core/routeNormalizer/utils/typeGuards_Utils_declarativeRoutes.js";
import {defaultHandler_makeRouteWorks} from "../core/routeNormalizer/utils/defaultHandler_makeRouteWorks.js";
import {buildFromObjectRouteFactory} from "../core/routeNormalizer/utils/buildFromObjectRouteFactory.js";
import {MiddlewareResolver} from "../core/MiddlewaresResolver/MiddlewareResolver.js";
import {ClassicMiddlewareStrategy} from "../core/MiddlewaresResolver/ClassicMwStrategy.js";
import {FunctionFactoryMwStrategy} from "../core/MiddlewaresResolver/FunctionFactoryMwStrategy.js";
import {defineModuleFactory} from "../core/defineModule/defineModuleFactory.js";
import {validateRouteMap} from "../core/routeNormalizer/utils/validateRouteMap.js";

export const defineModule = defineModuleFactory({
    normalizeRouteMap: normalizeRouteMapFactory({
        splitMethodPathFn: splitMethodPath,
        validateRouteMapFn: validateRouteMap,
        defaultHandlerFn: defaultHandler_makeRouteWorks,
        isHandlerFn: isHandler,
        isHandlerArrayFn: isHandlerArray,
        isObjectRouteFn: isObjectRoute,
        buildFromObjectRouteFn: buildFromObjectRouteFactory({
            defaultHandlerFn: defaultHandler_makeRouteWorks,
            splitMethodPathFn: splitMethodPath,
            mwResolver: new MiddlewareResolver([
                new ClassicMiddlewareStrategy(),
                new FunctionFactoryMwStrategy()
            ]),
        })
    })
});