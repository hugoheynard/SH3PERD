import argon2 from "argon2";
import { BaseHasherStrategy } from "./BaseHasherStrategy.js";
import type {IArgon2_Options, ICompareResult_copy, IHasherConfigObject, IHashParser} from "../types/Interfaces.js";

/**
 * Argon2Hasher
 *
 * Implements password hashing and verification using the Argon2 algorithm.
 * Inherits from BaseHasherStrategy to leverage shared formatting and config logic.
 */
export class Argon2Hasher extends BaseHasherStrategy<IArgon2_Options> {
    constructor(input: {
        configObject: IHasherConfigObject<IArgon2_Options>;
        hashParser: IHashParser;
    }) {
        super(input);
    }

    /**
     * Hash a plaintext password using the configured Argon2 options.
     * The result is a versioned hash with metadata.
     */
    async hashPassword(input: { password: string }): Promise<string> {
        const { password } = input;
        const configOptions = this.configObject.configOptions;

        const hashedPassword = await argon2.hash(password, configOptions);

        // Use formatHash() from BaseHasherStrategy
        return this.formatHash(hashedPassword);
    };

    /**
     * Verify a plaintext password against a previously hashed version.
     * Automatically extracts the raw hash from the versioned format.
     */
    async comparePassword(input: {
        password: string;
        hashedPassword: string;
    }): Promise<ICompareResult_copy> {
        const { password, hashedPassword } = input;
        const parsed = this.hashParser.extract(hashedPassword);

        const rawHash = parsed.rawHash;

        if (!rawHash.startsWith("$argon2")) {
            throw new Error("Invalid Argon2 hash format");
        }

        const isValid =  await argon2.verify(rawHash, password);

        return {
            isValid,
            wasRehashed: false,
        };
    }
}
