import type {NextFunction, Request, Response} from "express";
import {withErrorHandler} from "@sh3pherd/shared-utils";
import type {TLoginUseCase} from "../../domain/useCase.types";

export type TAuthControllerDeps = {
    loginUseCase: TLoginUseCase;
}

export interface IAuthController {
    login: (req: Request, res: Response, next: NextFunction)=> Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction)=> Promise<void>;
}

export class AuthController {
    private readonly loginUseCase: TLoginUseCase;

    constructor(deps: TAuthControllerDeps) {
        this.loginUseCase = deps.loginUseCase;
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
        res.status(200).json(await this.loginUseCase({
            email: req.body.email,
            password: req.body.password,
        }));
        return;
    };

    @withErrorHandler
    public async logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
        return;
    };
}