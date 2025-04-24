import type {NextFunction, Request, Response} from "express";
import type {IRegisterController, TRegisterControllerDeps} from "@sh3pherd/shared-types";
import {withErrorHandler} from "@sh3pherd/shared-utils";


export class RegisterController implements IRegisterController {
    private readonly deps: TRegisterControllerDeps;

    constructor(deps: TRegisterControllerDeps) {
        this.deps = deps;
    };

    @withErrorHandler
    public async registerUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const { email, password } = req.body;
        res.status(201).json(await this.deps.registerUserUseCase({ email, password }));
        return;
    };
}