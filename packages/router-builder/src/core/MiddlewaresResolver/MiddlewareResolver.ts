import type {RequestHandler} from "express";
import type {IAbstractMiddlewareResolver, RouteFactoryContext, TMiddlewareEntry} from "../../types/types.js";
import type {MiddlewareStrategy} from "./IMiddlewareStrategy.interface.js";

/**
 * Main resolver that delegates to strategies.
 */
export class MiddlewareResolver implements IAbstractMiddlewareResolver{
    constructor(private strategies: MiddlewareStrategy[]) {}

    setContext(context: RouteFactoryContext): void {
        for (const strategy of this.strategies) {
            if ('setContext' in strategy && typeof strategy.setContext === 'function') {
                strategy.setContext(context);
            }
        }
    };

    async resolveAll(entries: TMiddlewareEntry[]): Promise<RequestHandler[]> {
        const resolved: RequestHandler[] = [];

        for (const entry of entries) {

            const strategy = this.strategies.find((s) => s.supports(entry));

            if (!strategy) {
                throw new Error("Unsupported middleware entry");
            }


            resolved.push(await strategy.resolve(entry));
        }

        return resolved;
    }

}
