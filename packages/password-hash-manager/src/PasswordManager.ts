import type {
    ICompareResult,
    IHasherStrategy, IPasswordManager,
    IPasswordManagerInput, THashParserFunction,
    TVerifyLastHashDateFunction
} from "../types/Interfaces";


export class PasswordManager implements IPasswordManager {
    private readonly registry: Record<string, IHasherStrategy>;
    private readonly currentStrategyKey: string;
    private readonly hashParserFunction: THashParserFunction;
    private readonly verifyLastHashDateFunction: TVerifyLastHashDateFunction;
    private readonly rehashAfterDays: number;

    constructor(input: IPasswordManagerInput) {
        this.currentStrategyKey = input.currentStrategyKey;
        this.registry = input.registry;
        this.hashParserFunction = input.hashParserFunction;
        this.verifyLastHashDateFunction = input.verifyLastHashDateFunction;
        this.rehashAfterDays = input.rehashAfterDays;

        if (this.registry[this.currentStrategyKey] === undefined) {
            throw new Error(`Invalid strategy key: ${this.currentStrategyKey}`);
        }
    };

    hashPassword(input: { password: string }): Promise<string> {
        const { password } = input;
        const strategy = this.registry[this.currentStrategyKey];
        return strategy.hashPassword({ password: password });
    };

    comparePassword(input: { password: string, hashedPassword: string }): Promise<ICompareResult> {
        const { password, hashedPassword } = input;
        return this.verifyAndMaybeRehash({ password, hashedPassword});
    };

    private async verifyAndMaybeRehash(input: { password: string, hashedPassword: string }): Promise<ICompareResult> {
        const { password, hashedPassword} = input;

        /**
         * identifies the hash strategy used to hash the password
         * throws an error if the strategy is not supported
         */
        const parsed = this.hashParserFunction(hashedPassword);
        const key: string = `${parsed.algorithm}:${parsed.versionConfig}`;
        const strategy: IHasherStrategy = this.registry[key];

        if (!strategy) {
            throw new Error(`Unsupported hash strategy: ${key}`);
        }

        const isValid: boolean = await strategy.comparePassword({ password, hashedPassword });
        if (!isValid) return { isValid: false, wasRehashed: false };

        const needsRehash = (() => {
            if (key !== this.currentStrategyKey) return true;
            if (this.rehashAfterDays && parsed.hashed_at) {
                return this.verifyLastHashDateFunction(
                    {
                        lastHashDate: parsed.hashed_at,
                        rehashAfterDays: this.rehashAfterDays
                    });
            }
            return false;
        })();

        if (needsRehash) {
            const newHash: string = await this.registry[this.currentStrategyKey].hashPassword({ password });
            return { isValid: true, wasRehashed: true, newHash };
        }

        return { isValid: true, wasRehashed: false };
    }
}