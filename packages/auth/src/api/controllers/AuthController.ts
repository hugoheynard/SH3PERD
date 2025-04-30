import type {NextFunction, Request, Response} from "express";
import {autoBind, withErrorHandler} from "@sh3pherd/shared-utils";
import type {IAuthController, TAuthControllerDeps} from "@sh3pherd/shared-types";

@autoBind
export class AuthController implements IAuthController {
    private readonly deps: TAuthControllerDeps

    constructor(deps: TAuthControllerDeps) {
        this.deps = deps;
    };

    /**
     * login - Handles user authentication using email and password.
     *
     * This method orchestrates the login process:
     * - Looks up the user by email
     * - Verifies the password using the injected hashing service
     * - Creates a full authentication session (access + refresh tokens)
     *
     * @param req - The request object containing email and password in the body
     * @param res - The response object to send the result
     * @param _next
     */
    @withErrorHandler
    public async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const { authToken, refreshToken, user_id, refreshTokenSecureCookie } = await this.deps.loginUseCase({
            email: req.body.email,
            password: req.body.password,
        });

        res.cookie(
            refreshTokenSecureCookie.name,
            refreshTokenSecureCookie.value,
            refreshTokenSecureCookie.options
        );

        res.status(200).json({
            authToken,
            user_id,
        });

        return;
    };

    /**
     * refreshSession - Refreshes the user's authentication session.
     *
     * This method checks the validity of the current access token and refresh token.
     * If the access token is invalid or expired, it uses the refresh token to create a new session.
     *
     * @param req - The request object containing the current access token in headers and refresh token in cookies
     * @param res - The response object to send the result
     * @param _next
     */
    @withErrorHandler
    public async refreshSession(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const currentAuthToken = req.headers["authorization"]?.split(" ")[1];
        const currentRefreshToken = req.cookies["refreshToken"];

        const { user_id, refreshTokenSecureCookie, authToken } = await this.deps.verifyAndRefreshUseCase({
            authToken: currentAuthToken,
            refreshToken: currentRefreshToken,
        });

        const isSameAuthToken: boolean = authToken === currentAuthToken;
        const isSameRefreshToken: boolean = currentRefreshToken === refreshTokenSecureCookie.value;

        if (isSameAuthToken && isSameRefreshToken) {
            req.user = { user_id };
            return res.status(200).json({ user_id });
        }

        res.cookie(
            refreshTokenSecureCookie.name,
            refreshTokenSecureCookie.value,
            refreshTokenSecureCookie.options
        );

        res.status(200).json({
            authToken,
            user_id,
        });

        return;

    };

    @withErrorHandler
    public async logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
        return;
    };
}