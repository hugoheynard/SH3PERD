import type {IRegisterService, IRegisterServiceInput} from "../../domain/models/IRegisterServiceInput";
import type {TSaveUserResult, UserDomainModel} from "@sh3pherd/user";


export class RegisterService implements IRegisterService {
    private readonly generateUserIdFunction: IRegisterServiceInput['generateUserIdFunction'];
    private readonly hashPasswordFunction: IRegisterServiceInput['hashPasswordFunction'];
    private readonly createUserFunction: IRegisterServiceInput['createUserFunction'];
    private readonly saveUserFunction: IRegisterServiceInput['saveUserFunction'];
    private readonly findUserByEmailFunction: IRegisterServiceInput['findUserByEmailFunction'];

    constructor(input: IRegisterServiceInput) {
        this.generateUserIdFunction = input.generateUserIdFunction;
        this.hashPasswordFunction = input.hashPasswordFunction;
        this.createUserFunction = input.createUserFunction;
        this.saveUserFunction = input.saveUserFunction;
        this.findUserByEmailFunction = input.findUserByEmailFunction;
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

    async getUserByEmail(input: { email: string }): Promise<UserDomainModel | null>{
        return await this.findUserByEmailFunction({ email: input.email });
    };
}