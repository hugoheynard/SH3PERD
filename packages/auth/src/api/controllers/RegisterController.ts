import type {NextFunction, Request, Response} from "express";
import {withErrorHandler} from "@sh3pherd/shared-utils";


export interface IRegisterController {
    registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

type TRegisterControllerDeps = {
    registerUserUseCase: any;
}

export class RegisterController implements IRegisterController {
    private readonly registerUserUseCase: any;

    constructor(deps: TRegisterControllerDeps) {
        this.registerUserUseCase = deps.registerUserUseCase;
    };

    @withErrorHandler
    public async registerUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
        const { email, password } = req.body;
        res.status(201).json(await this.registerUserUseCase({ email, password }));
        return;
    };
}