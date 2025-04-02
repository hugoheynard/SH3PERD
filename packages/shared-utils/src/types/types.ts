import type {Request, Response, NextFunction} from "express";

export type MiddlewareFn = (req: Request, res: Response, _next?: NextFunction) => void | Promise<void>;