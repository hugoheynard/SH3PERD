import type {
    ICompareResult,
    IHasherStrategy,
    IHashParser,
    TVerifyLastHashDateFunction
} from "../types/Interfaces";


export class PasswordManager implements IHasherStrategy {
    private readonly registry: Record<string, IHasherStrategy>;
    private readonly currentStrategyKey: string;
    private readonly hashParser: IHashParser;
    private readonly verifyLastHashDateFunction: TVerifyLastHashDateFunction;
    private readonly rehashAfterDays?: number;

    constructor(input: {
        currentStrategyKey: string;
        registry: Record<string, IHasherStrategy>;
        hashParser: IHashParser;
        verifyLastHashDateFunction: TVerifyLastHashDateFunction
        rehashAfterDays?: number;
    }) {
        this.currentStrategyKey = input.currentStrategyKey;
        this.registry = input.registry;
        this.hashParser = input.hashParser;
        this.verifyLastHashDateFunction = input.verifyLastHashDateFunction;
        this.rehashAfterDays = input.rehashAfterDays;

        if (!this.registry[this.currentStrategyKey]) {
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

        return this.verifyAndMaybeRehash({
            password,
            hashedPassword,
            registry: this.registry,
            currentStrategyKey: this.currentStrategyKey,
            hashParser: this.hashParser,
            onRehash: this.onRehash,
            rehashAfterDays: this.rehashAfterDays,
        });
    };

    private async verifyAndMaybeRehash(input: { password: string, hashedPassword: string }): Promise<ICompareResult> {
        const { password, hashedPassword} = input;

        /**
         * identifies the hash strategy used to hash the password
         * throws an error if the strategy is not supported
         */
        const parsed = this.hashParser.extract(hashedPassword);
        const key: string = `${parsed.algorithm}:${parsed.versionConfig}`;
        const strategy: IHasherStrategy = this.registry[key];

        if (!strategy) {
            throw new Error(`Unsupported hash strategy: ${key}`);
        }

        const isValid: boolean = await strategy.comparePassword({ password, hashedPassword });
        if (!isValid) return { isValid: false, wasRehashed: false };

        const needsRehash = (() => {
            if (key !== this.currentStrategyKey) return true;
            if (this.rehashAfterDays && parsed.date) {
                return this.verifyLastHashDateFunction(
                    {
                        lastHashDate: parsed.date,
                        rehashAfterDays: this.rehashAfterDays
                    });
            }
            return false;
        })();

        if (needsRehash && onRehash) {
            const newHash: string = await this.registry[this.currentStrategyKey].hashPassword({ password });
            return { isValid: true, wasRehashed: true, newHash };
        }

        return { isValid: true, wasRehashed: false };
    }
}