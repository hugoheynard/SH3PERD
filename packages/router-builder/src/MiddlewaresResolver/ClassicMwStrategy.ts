import type {MiddlewareStrategy} from "./IMiddlewareStrategy.interface.js";
import type {RequestHandler} from "express";


export class ClassicMiddlewareStrategy implements MiddlewareStrategy<RequestHandler> {
    supports(entry: unknown): entry is RequestHandler {
        /** Check if the entry is a function and has 3 parameters (req, res, next),
         which is typical for Express middleware without injection
         */
        return typeof entry === 'function' && entry.length === 3;
    };

    async resolve(entry: RequestHandler): Promise<RequestHandler> {
        return entry;
    };
}
