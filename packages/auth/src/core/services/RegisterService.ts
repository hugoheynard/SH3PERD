import type {IRegisterService, IRegisterServiceInput} from "./IRegisterServiceInput";


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

    async registerUser(input: { email: string, password: string }): Promise<any> {
        const hashedPassword = await this.hashPasswordFunction({ password: input.password });

        const user = await this.createUserFunction({
            email: input.email,
            password: hashedPassword,
            user_id: this.generateUserIdFunction(),
        });

        await this.saveUserFunction(user);

        return { user_id: user.user_id };
    };

    async getUserByEmail(input: { email: string }): Promise<any>{
        return await this.findUserByEmailFunction({ email: input.email });
    };
}