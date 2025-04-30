import type {NextFunction, Request, Response} from "express";
import type {TAuthTokenPayload, TVerifyAuthToken} from "@sh3pherd/shared-types";
import {BusinessError} from "@sh3pherd/shared-utils";


/**
 * Middleware to verify the validity of an access token.
 *
 * 🔒 This middleware:
 * - Extracts the token from the `Authorization` header
 * - Verifies the token using a provided verification function
 * - If valid, attaches `user_id` to `req.user` and continues to the next middleware
 * - If invalid or missing, throws a `BusinessError` with a 401 status
 *
 * ⚠️ It does NOT handle refresh logic. Only verification of `authToken`.
 *
 * @param deps - Dependencies injected into the middleware
 * @param deps.verifyAuthTokenFn - A function that verifies the access token and returns its payload
 *
 * @throws BusinessError (401) if the token is missing or invalid
 *
 * @example
 * app.use('/protected', verifyAuthToken({ verifyAuthTokenFn }));
 */
export const verifyAuthToken = (deps: { verifyAuthTokenFn: TVerifyAuthToken }) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authToken: string | undefined = req.headers["authorization"]?.split(" ")[1];

    if (!authToken) {
        const err =  new BusinessError(
            "Missing auth token",
            "MISSING_AUTH_TOKEN",
            401
        );
        return next(err);
    }

    const payload: TAuthTokenPayload | null = await deps.verifyAuthTokenFn({ authToken: authToken });

    if (!payload) {
        const err =  new BusinessError(
            "Invalid auth token",
            "INVALID_AUTH_TOKEN",
            401
        );
        return next(err);
    }

    req.user = payload.user_id
    return next();
};