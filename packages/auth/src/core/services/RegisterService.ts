import type {IRegisterService, RegisterServiceTypes} from "../../domain/models/registerService.types";
import type {TSaveUserResult, TUserDomainModel} from "@sh3pherd/user";


export class RegisterService implements IRegisterService {
    private readonly generateUserIdFunction: RegisterServiceTypes['generateUserIdFn'];
    private readonly hashPasswordFunction: RegisterServiceTypes['hashPasswordFn'];
    private readonly createUserFunction: RegisterServiceTypes['createUserFn'];
    private readonly saveUserFunction: RegisterServiceTypes['saveUserFn'];
    private readonly findUserByEmailFunction: RegisterServiceTypes['findUserByEmailFn'];

    constructor(input: RegisterServiceTypes) {
        this.generateUserIdFunction = input.generateUserIdFn;
        this.hashPasswordFunction = input.hashPasswordFn;
        this.createUserFunction = input.createUserFn;
        this.saveUserFunction = input.saveUserFn;
        this.findUserByEmailFunction = input.findUserByEmailFn;
    };

    async registerUser(input: { email: string, password: string }): Promise<TSaveUserResult> {
        const hashedPassword = await this.hashPasswordFunction({ password: input.password });

        const user = await this.createUserFunction({
            email: input.email,
            password: hashedPassword,
            user_id: this.generateUserIdFunction(),
        });

        const saveResult = await this.saveUserFunction({ user: user});

        return saveResult;
    };

    async getUserByEmail(input: { email: string }): Promise<TUserDomainModel | null>{
        return await this.findUserByEmailFunction({ email: input.email });
    };
}