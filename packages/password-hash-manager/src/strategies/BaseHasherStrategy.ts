import type {IHasherConfigObject, IHasherStrategy, IHashParser} from "../types/Interfaces";


export abstract class BaseHasherStrategy<TOptions> implements IHasherStrategy {
    protected readonly configObject: IHasherConfigObject<TOptions>;
    protected readonly hashParser: IHashParser;

    constructor(input: {
        configObject: IHasherConfigObject<TOptions>;
        hashParser: IHashParser;
    }) {
        this.configObject = input.configObject;
        this.hashParser = input.hashParser;
    }

    protected formatHash(realHash: string): string {
        const date = new Date().toISOString().split('T')[0];
        return [
            this.configObject.library,
            this.configObject.algorithm,
            this.configObject.versionConfig,
            date,
            realHash
        ].join(':::');
    };

    abstract hashPassword(input: { password: string }): Promise<string>;
    abstract comparePassword(input: { password: string, hashedPassword: string }): Promise<boolean>;
}
