import type { IHasherStrategy, IHashParser } from '../types/Interfaces.js';
import { Argon2Hasher } from '../strategies/Argon2Hasher.js';
import { argon2Hasher_config_v1 } from './configObjects/argon2Hasher_configObjects.js';
import { BcryptHasher } from '../strategies/BcryptHasher.js';
import { bcryptHasher_config_v1 } from './configObjects/bcrypt_configObjects.js';

/**
 * Factory function to create a hasher registry.
 *
 * Injects a shared IHashParser into all hasher strategies.
 *
 * @returns A registry mapping versioned strategy keys to their implementations
 * @param input { hashParser: IHashParser }
 */
export const createHasherRegistry = (input: {
  hashParser: IHashParser;
}): Record<string, IHasherStrategy> => {
  const { hashParser } = input;

  return {
    'argon2id:v1': new Argon2Hasher({
      configObject: argon2Hasher_config_v1,
      hashParser: hashParser,
    }),
    'bcrypt:v1': new BcryptHasher({ configObject: bcryptHasher_config_v1, hashParser: hashParser }),

    // Future strategies here
    // 'pbkdf2:v1': ...
  };
};
