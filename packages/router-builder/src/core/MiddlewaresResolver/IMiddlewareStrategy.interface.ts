import type { RequestHandler } from "express";

/**
 * Generic strategy interface for transforming a middleware entry into a RequestHandler.
 */
export interface MiddlewareStrategy<TEntry = unknown> {
    /**
     * Checks if this strategy supports the given middleware entry.
     * Should narrow the type via `entry is TEntry`.
     */
    supports(entry: unknown): entry is TEntry;
    /**
     * Resolves a middleware entry into a valid Express RequestHandler.
     */
    resolve(entry: TEntry): Promise<RequestHandler>;
}

