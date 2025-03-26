import type { IHasherStrategy, IHashParser } from "../types/Interfaces";

/**
 * PasswordManager
 *
 * Central entry point for password operations.
 * Delegates hashing and verification to the correct hasher strategy based on configuration and metadata.
 */
export class PasswordUtil {
    private readonly registry: Record<string, IHasherStrategy>;
    private readonly currentStrategyKey: string = 'argon2id:v1';
    private readonly hashParser: IHashParser;

    constructor(input: {
        registry: Record<string, IHasherStrategy>,
        hashParser: IHashParser,
        currentStrategyKey: string
    }) {
        this.registry = input.registry;
        this.hashParser = input.hashParser;
        this.currentStrategyKey = input.currentStrategyKey;
    };

    /**
     * Hash a password using the currently configured strategy.
     */
    async hashPassword(input: { password: string }): Promise<string> {
        const strategy = this.registry[this.currentStrategyKey];

        if (!strategy) {
            throw new Error(`Hashing strategy not found for key: ${this.currentStrategyKey}`);
        }
        return strategy.hashPassword(input);
    };

    /**
     * Compare a password to a versioned hash.
     * Automatically resolves the correct strategy from the hash metadata.
     */
    async comparePassword(input: { password: string, hashedPassword: string }): Promise<boolean> {
        const { hashedPassword } = input;
        const extracted = this.hashParser.extract(hashedPassword);
        const key = `${extracted.algorithm}:${extracted.version}`;

        const strategy = this.registry[key];
        if (!strategy) {
            throw new Error(`No hasher strategy found for key: ${key}`);
        }

        return strategy.comparePassword(input);
    }
}
