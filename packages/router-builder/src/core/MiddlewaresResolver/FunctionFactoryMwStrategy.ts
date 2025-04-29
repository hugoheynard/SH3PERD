import type { MiddlewareStrategy } from "./IMiddlewareStrategy.interface.js";
import type { RequestHandler } from "express";

export class FunctionFactoryMwStrategy implements MiddlewareStrategy<(deps: any) => RequestHandler> {
    private context: Record<string, unknown> = {};

    setContext(context: Record<string, unknown>): void {
        this.context = context;
    }

    supports(entry: unknown): entry is (deps: Record<string, unknown>) => RequestHandler {
        const result = typeof entry === 'function';
        return result;
    }

    async resolve(entry: (deps: any) => RequestHandler): Promise<RequestHandler> {

        const fnStr = entry.toString();

        const missingKeys = this.getMissingDeps(entry, this.context);

        if (missingKeys.length > 0) {
            throw new Error(`Missing injected dependencies: ${missingKeys.join(', ')}`);
        }

        return entry(this.context);
    }

    private getMissingDeps(fn: Function, context: Record<string, unknown>): string[] {
        const fnStr = fn.toString();

        // Match destructured params in arrow or function syntax
        const destructureMatch = fnStr.match(/^[^(]*\(?\{\s*([^}]+?)\s*\}\)?\s*(=>|\{)/);
        if (destructureMatch) {
            const keys = destructureMatch[1]
                .split(',')
                .map(k => k.trim().split(':')[0])
                .filter(Boolean);
            return keys.filter(k => !(k in context));
        }

        // Try to catch transpiled `.key` usage like `_a.suffix`
        const fallbackMatch = [...fnStr.matchAll(/(?:\w+)\.(\w+)/g)];
        const props = fallbackMatch.map(m => m[1]);
        const uniqueProps = [...new Set(props)];

        return uniqueProps.filter(k => !(k in context));
    }

}
