import { pbkdf2, randomBytes } from 'crypto';
import { promisify } from 'util';

/**
 * A class for securely hashing and verifying passwords using PBKDF2.
 * It provides methods for generating a salted hash of a password and for verifying
 * passwords against stored hashes.
 */

export class PasswordHasher{
    //In a world of innocent sheeps, only a wise shepherd can keep the herd alive!;
    /**
     * @private
     * @type {function}
     */
    static #pbkdf2Async = promisify(pbkdf2);

    /**
     * @private
     * @type {object}
     * @property {number} iterations - The number of iterations for the PBKDF2 algorithm.
     * @property {number} keyLength - The desired length of the derived key in bytes.
     * @property {string} digest - The hash function to use (e.g., 'sha512').
     */
    static #hashParams = {
        iterations: 200000,
        keyLength: 64,
        digest: 'sha512'
    };

    /**
     * Generates a random salt.
     * @returns {string} A hexadecimal string representing the generated salt.
     */
    generateSalt() {
        return randomBytes(16).toString('hex');
    };

    /**
     * Generates a derived key from a password and a salt using PBKDF2.
     * @param {string} password - The password to derive the key from.
     * @param {string} salt - The salt to use for the key derivation.
     * @returns {Promise<string>} A promise that resolves to the derived key.
     */
    static async generateKey(password, salt) {
        const { iterations, keyLength, digest } = PasswordHasher.#hashParams;
        const derivedKey = await PasswordHasher.#pbkdf2Async(password, salt, iterations, keyLength, digest);
        return derivedKey.toString('hex');
    };

    /**
     * Hashes a password by generating a salt and deriving a key.
     * @param {Object} input - The input object.
     * @param {string} input.password - The password to hash.
     * @returns {Promise<string>} A promise that resolves to the salted hash.
     * @throws {Error} If the password is missing or invalid.
     */
    async hashPass(input) {
        if (!input || !input.password) {
            throw new Error('Password is required.');
        }

        const salt = input.salt ?? this.generateSalt();
        const derivedKey = await PasswordHasher.generateKey(input.password, salt);

        return `${salt}:${derivedKey}`;
    };

    /**
     * Verifies a password against a stored hash.
     * @param {Object} input - The input object.
     * @param {string} input.storedHash - The stored hash to verify against.
     * @param {string} input.password - The password to verify.
     * @returns {Promise<boolean>} A promise that resolves to a boolean indicating
     * whether the password is valid.
     * @throws {Error} If the stored hash or password is missing or invalid.
     */
    async verify(input) {
        if (!input || !input.storedHash || !input.password) {
            throw new Error('Stored hash and password are required for verification.');
        }

        const [salt, storedKey] = input.storedHash.split(':');
        const derivedKey = await PasswordHasher.generateKey(input.password, salt);


        return storedKey === derivedKey;
    };
}