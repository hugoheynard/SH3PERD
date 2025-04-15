import bcrypt from "bcrypt";
import {BaseHasherStrategy} from "./BaseHasherStrategy";
import type {Bcrypt_Options, ICompareResult_copy, IHasherConfigObject, IHashParser} from "../types/Interfaces";


/**
 * BcryptHasher
 *
 * Implements password hashing and verification using the Bcrypt algorithm.
 * Extends BaseHasherStrategy for unified hash formatting and metadata handling.
 */
export class BcryptHasher extends BaseHasherStrategy<Bcrypt_Options> {
    constructor(input: {
        configObject: IHasherConfigObject<Bcrypt_Options>;
        hashParser: IHashParser;
    }) {
        super(input);
    };

    /**
     * Hash a plaintext password using Bcrypt with the configured salt rounds.
     */
    async hashPassword(input: { password: string }): Promise<string> {
        const { password } = input;
        const { saltRounds } = this.configObject.configOptions;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Wrap with metadata (version, algo, date, etc.)
        return this.formatHash(hashedPassword);
    }

    /**
     * Verify a password against a previously hashed Bcrypt version.
     * Extracts the raw hash via the shared parser.
     */
    async comparePassword(input: {
        password: string;
        hashedPassword: string;
    }): Promise<ICompareResult_copy> {
        const { password, hashedPassword } = input;

        const parsed = this.hashParser.extract(hashedPassword);
        const rawHash = parsed.rawHash;

        // anti bad algo security
        if (!rawHash.startsWith("$2")) {
            throw new Error("Invalid Bcrypt hash format");
        }

        const isValid =  await bcrypt.compare(password, rawHash);

        return {
            isValid,
            wasRehashed: false,
        }


    }
}
