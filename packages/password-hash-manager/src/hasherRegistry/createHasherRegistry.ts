import type {IHasherStrategy, IHashParser} from "../types/Interfaces";
import {Argon2Hasher} from "../strategies/Argon2Hasher";
import {argon2Hasher_config_v1} from "./configObjects/argon2Hasher_configObjects";
import {BcryptHasher} from "../strategies/BcryptHasher";
import {bcryptHasher_config_v1} from "./configObjects/bcrypt_configObjects";


/**
 * Factory function to create a hasher registry.
 *
 * Injects a shared IHashParser into all hasher strategies.
 *
 * @returns A registry mapping versioned strategy keys to their implementations
 * @param input { hashParser: IHashParser }
 */
export const createHasherRegistry = (input: { hashParser: IHashParser }): Record<string, IHasherStrategy> => {
    const { hashParser } = input;

    return {
        'argon2id:v1': new Argon2Hasher({ configObject: argon2Hasher_config_v1, hashParser: hashParser }),
        'bcrypt:v1': new BcryptHasher({ configObject: bcryptHasher_config_v1, hashParser: hashParser }),

        // Future strategies here
        // 'pbkdf2:v1': ...
    };
}
