/**
 * ✅ Type guards for declarative routes
 *
 * These utilities help safely distinguish between different forms of route definitions
 * in a declarative routing system. They are particularly useful when normalizing or validating
 * user-defined route configurations before runtime.
 */

import type { RequestHandler } from "express";
import type { THttpMethod, TObjectRoute } from "../../../types/types.js";

/**
 * Determines if a value is a valid Express request handler function.
 *
 * @param val - The value to test.
 * @returns True if the value is a single Express request handler.
 */
export function isHandler(val: unknown): val is RequestHandler {
    return typeof val === 'function';
}

/**
 * Determines if a value is an array of valid Express request handlers.
 *
 * @param val - The value to test.
 * @returns True if the value is an array where every element is a handler function.
 */
export function isHandlerArray(val: unknown): val is RequestHandler[] {
    return Array.isArray(val) && val.every(isHandler);
}

/**
 * Determines if a value is a valid `TObjectRoute` declaration.
 *
 * A TObjectRoute is considered valid if it has at least a `handler` (single or array)
 * or a `mw` (middleware array) property.
 *
 * @param val - The value to test.
 * @returns True if the object matches the expected shape of a TObjectRoute.
 */
export function isObjectRoute(val: unknown): val is TObjectRoute {
    return typeof val === 'object' && val !== null &&
        (
            ('handler' in val && (typeof (val as any).handler === 'function' || isHandlerArray((val as any).handler))) ||
            ('mw' in val && Array.isArray((val as any).mw))
        );
}

/**
 * Splits a `method:path` string (e.g., `"get:/users"`) into its method and path components.
 *
 * This utility is used internally to deconstruct declarative route keys
 * into their HTTP method and path segments.
 *
 * @param key - The combined method:path string.
 * @returns A tuple `[method, path]` where `method` is a THttpMethod and `path` is a string starting with `/`.
 */
export function splitMethodPath(key: string): [method: THttpMethod, path: string] {
    const idx = key.indexOf(':');
    if (idx === -1) return [key as THttpMethod, '/'];

    const method = key.slice(0, idx) as THttpMethod;
    const path = key.slice(idx + 1);
    return [method, path || '/'];
}


