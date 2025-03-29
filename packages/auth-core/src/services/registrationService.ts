import type {IRegistrationService} from "../types/IRegistrationService";


export class RegistrationService implements IRegistrationService['output'] {
    private readonly generateUserIdFunction: IRegistrationService['input']['generateUserIdFunction'];
    private readonly hashPasswordFunction: IRegistrationService['input']['hashPasswordFunction'];
    private readonly createUserFunction: IRegistrationService['input']['createUserFunction'];
    private readonly saveUserFunction: IRegistrationService['input']['saveUserFunction'];
    private readonly findUserByEmailFunction: IRegistrationService['input']['findUserByEmailFunction'];

    constructor(input: IRegistrationService['input']) {
        this.generateUserIdFunction = input.generateUserIdFunction;
        this.hashPasswordFunction = input.hashPasswordFunction;
        this.createUserFunction = input.createUserFunction;
        this.saveUserFunction = input.saveUserFunction;
        this.findUserByEmailFunction = input.findUserByEmailFunction;
    };

    async getUserLoginByEmail(input: { email: string }): Promise<any>{
        return await this.findUserByEmailFunction({ email: input.email });
    };


    async registerUser(input: { email: string, password: string }): Promise<any> {
        const hashedPassword = await this.hashPasswordFunction({ password: input.password });

        const user = await this.createUserFunction({
            email: input.email,
            password: hashedPassword,
        });

        await this.saveUserFunction(user);

        return { user_id: user.user_id };
    };
}