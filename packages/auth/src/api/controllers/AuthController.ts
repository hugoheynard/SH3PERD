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
        const { authToken, user_id, refreshTokenSecureCookie } = await this.deps.loginUseCase({
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
        const currentRefreshToken = req.cookies['sh3pherd_refreshToken'];

        const {
            user_id,
            refreshTokenSecureCookie,
            authToken
        } = await this.deps.refreshSessionUseCase({ refreshToken: currentRefreshToken });

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
        // use case deletes the refresh token from the database
        await this.deps.logoutUseCase({ refreshToken: req.cookies['sh3pherd_refreshToken'] });

        // Clear the refresh token cookie
        res.clearCookie('sh3pherd_refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/'
        });

        // Send a success response
        res.status(200).json({ message: 'Logout successful' });
        return;
    };
}