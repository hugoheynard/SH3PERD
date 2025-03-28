import { jest } from '@jest/globals';


import type {
    IHasherStrategy,
    TAlgoLibs,
    TAlgorithms,
    THashParserFunction,
    TVerifyLastHashDateFunction
} from "../src/types/Interfaces";
import {PasswordManager} from "../src/PasswordManager";

export const createMockHasherStrategy = (isValid: boolean): IHasherStrategy => ({
    hashPassword: jest.fn(({ password }) => Promise.resolve(`hashed-${password}`)),
    comparePassword: jest.fn(({ password, hashedPassword }) =>
        Promise.resolve(isValid && hashedPassword === `hashed-${password}`)
    ),
});

export const mockParsedHash = (
    overrides?: Partial<ReturnType<THashParserFunction>>
): ReturnType<THashParserFunction> => ({
    library: 'argon2' as TAlgoLibs,
    algorithm: 'argon2id' as TAlgorithms,
    versionConfig: 'v1',
    hashed_at: new Date().toISOString(),
    rawHash: 'some-hash',
    ...overrides,
});

export const createMockHashParser = (
    overrides?: Partial<ReturnType<THashParserFunction>>
): jest.MockedFunction<THashParserFunction> =>
    jest.fn((_hash) => mockParsedHash(overrides));

export const createMockDateVerifier = (
    shouldRehash: boolean
): jest.MockedFunction<TVerifyLastHashDateFunction> =>
    jest.fn(() => shouldRehash);

describe('PasswordManager', () => {
    let passwordManager: PasswordManager;

    beforeEach(() => {
        const mockStrategy = createMockHasherStrategy(true);
        const registry = { 'argon2id:v1': mockStrategy };

        passwordManager = new PasswordManager({
            currentStrategyKey: 'argon2id:v1',
            registry,
            hashParserFunction: createMockHashParser(),
            verifyLastHashDateFunction: createMockDateVerifier(false),
            rehashAfterDays: 30,
        });
    });

    it('should validate a correct password', async () => {
        const result = await passwordManager.comparePassword({
            password: 'correct',
            hashedPassword: 'hashed-correct',
        });

        expect(result).toEqual({
            isValid: true,
            wasRehashed: false,
        });
    });

    it('should reject an incorrect password', async () => {
        const result = await passwordManager.comparePassword({
            password: 'wrong',
            hashedPassword: 'hashed-correct',
        });

        expect(result).toEqual({
            isValid: false,
            wasRehashed: false,
        });
    });

    it('should trigger rehash if version key is different', async () => {
        const mockStrategy = createMockHasherStrategy(true);
        const manager = new PasswordManager({
            currentStrategyKey: 'argon2id:v1',
            registry: {
                'argon2id:v1': mockStrategy,
                'argon2id:v2': mockStrategy,
            },
            hashParserFunction: createMockHashParser({ versionConfig: 'v2' }),
            verifyLastHashDateFunction: createMockDateVerifier(false),
            rehashAfterDays: 30,
        });

        const result = await manager.comparePassword({
            password: 'correct',
            hashedPassword: 'hashed-correct',
        });

        expect(result.wasRehashed).toBe(true);
        expect(result.newHash).toBeDefined();
    });

    it('should trigger rehash if hash is too old', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 40);

        const manager = new PasswordManager({
            currentStrategyKey: 'argon2id:v1',
            registry: { 'argon2id:v1': createMockHasherStrategy(true) },
            hashParserFunction: createMockHashParser({ hashed_at: pastDate.toISOString() }),
            verifyLastHashDateFunction: createMockDateVerifier(true),
            rehashAfterDays: 30,
        });

        const result = await manager.comparePassword({
            password: 'correct',
            hashedPassword: 'hashed-correct',
        });

        expect(result.wasRehashed).toBe(true);
        expect(result.newHash).toBeDefined();
    });
});
