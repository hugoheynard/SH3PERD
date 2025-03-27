import type {IHashParser} from "../../types/Interfaces";

/**
 * HashParser is a utility that extracts metadata from a versioned password hash string.
 *
 * The expected format of the hash string is:
 *   `${library}:::${algorithm}:::${versionConfig}:::${hashedAt}:::${rawHash}`
 *
 * Example:
 *   "bcrypt:::argon2:::v1:::2023-01-01:::abcd1234"
 *
 * This allows the system to identify which hashing strategy was used,
 * when the password was hashed, and the actual raw hash to verify.
 *
 * @throws {Error} If the hash string does not contain exactly 5 parts separated by ":::"
 */
export const HashParser: IHashParser = {
    extract:(versionedHash) => {
        const parts: string[] = versionedHash.split(":::");

        if (parts.length !== 5) {
            throw new Error(`Invalid hash format: expected 5 parts, got ${parts.length}`);
        }

        const [library, algorithm, versionConfig, hashed_at, rawHash] = parts;

        return {
            library,
            algorithm,
            versionConfig,
            hashed_at,
            rawHash,
        };
    },
};