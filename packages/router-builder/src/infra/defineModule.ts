import {normalizeRouteMapFactory} from "../routeNormalizer/normalizeRouteMapFactory.js";
import {
    isHandler,
    isHandlerArray,
    isObjectRoute,
    splitMethodPath
} from "../routeNormalizer/utils/typeGuards_Utils_declarativeRoutes.js";
import {defaultHandler_makeRouteWorks} from "../routeNormalizer/utils/defaultHandler_makeRouteWorks.js";
import {buildFromObjectRouteFactory} from "../routeNormalizer/utils/buildFromObjectRouteFactory.js";
import {MiddlewareResolver} from "../MiddlewaresResolver/MiddlewareResolver.js";
import {ClassicMiddlewareStrategy} from "../MiddlewaresResolver/ClassicMwStrategy.js";
import {FunctionFactoryMwStrategy} from "../MiddlewaresResolver/FunctionFactoryMwStrategy.js";
import {defineModuleFactory} from "../defineModule/defineModuleFactory.js";

export const defineModule = defineModuleFactory({
    normalizeRouteMap: normalizeRouteMapFactory({
        splitMethodPathFn: splitMethodPath,
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