import {BcryptHasher} from "../BcryptHasher";
import type {Bcrypt_Options, IHasherConfigObject, IHashParser, TAlgoLibs, TAlgorithms} from "../../types/Interfaces";
import { jest } from '@jest/globals';



describe("BcryptHasher", () => {
    const mockHashParser: IHashParser = {
        extract: jest.fn((versionedHash: string) => {
            const parts = versionedHash.split(":::");
            const [library, algorithm, versionConfig, hashed_at, rawHash] = parts;

            return {
                library: library as TAlgoLibs,
                algorithm: algorithm as TAlgorithms,
                versionConfig,
                hashed_at,
                rawHash,
            };
        }),
    };

    const mockConfig: IHasherConfigObject<Bcrypt_Options> = {
        library: "bcrypt",
        algorithm: "$2b$",
        versionConfig: "v1",
        configOptions: { saltRounds: 10 },
    };

    const hasher = new BcryptHasher({
        configObject: mockConfig,
        hashParser: mockHashParser,
    });

    const plainPassword = "mySecurePassword123";

    it("should hash and verify a password successfully", async () => {
        const hash = await hasher.hashPassword({ password: plainPassword });

        expect(hash).toMatch(/\$2[abxy]\$/);

        const result = await hasher.comparePassword({
            password: plainPassword,
            hashedPassword: hash,
        });

        expect(result).toStrictEqual({isValid: true, wasRehashed: false});
        expect(mockHashParser.extract).toHaveBeenCalledWith(hash);
    });

    it("should format the hash with metadata", async () => {
        const hash = await hasher.hashPassword({ password: plainPassword });
        const parts = hash.split(":::");

        expect(parts.length).toBe(5);
        expect(parts[0]).toBe("bcrypt");
        expect(parts[1]).toBe("$2b$");
        expect(parts[2]).toBe("v1");
        expect(parts[4]).toMatch(/^\$2[abxy]\$/); // Vérifie bien que le rawHash est un hash Bcrypt
    });

    it("should fail verification with a wrong password", async () => {
        const hash = await hasher.hashPassword({ password: plainPassword });

        const result = await hasher.comparePassword({
            password: "wrongPassword",
            hashedPassword: hash,
        });

        expect(result).toStrictEqual({isValid: false, wasRehashed: false});
    });

    it("should throw on invalid hash format", async () => {
        const badHash = "$invalid$format$hash";

        mockHashParser.extract = jest.fn(() => ({
            library: "bcrypt" as TAlgoLibs,
            algorithm: "bcrypt" as TAlgorithms,
            versionConfig: "v1",
            hashed_at: "20250326",
            rawHash: badHash,
        }));

        await expect(
            hasher.comparePassword({
                password: plainPassword,
                hashedPassword: badHash,
            })
        ).rejects.toThrow("Invalid Bcrypt hash format");
    });
});
