import {autoBind} from "../../../utils/classUtils/autoBind.js";
import type {IRegisterController, TRegisterControllerDeps} from "../../types/auth.api.controllers.js";
import {withErrorHandler} from "../../../utils/errorManagement/tryCatch/withErrorHandler.js";
import type {Request, Response, NextFunction} from "express";


@autoBind
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