import { jest } from '@jest/globals';
import type {IHasherStrategy, TAlgoLibs, TAlgorithms} from "../types/Interfaces";
import {PasswordManager} from "../src/PasswordManager";

describe('PasswordManager', () => {
    const mockHashParserFunction = jest.fn((_hash: string) => ({
        library: 'argon2' as TAlgoLibs,
        algorithm: 'argon2id' as TAlgorithms,
        versionConfig: 'v1',
        hashed_at: new Date().toISOString(),
        rawHash: 'raw',
    }));

    const mockVerifyLastHashDateFunction = jest.fn(() => false);

    const mockStrategy: IHasherStrategy = {
        hashPassword: jest.fn(({ password }) => Promise.resolve(`hashed-${password}`)),
        comparePassword: jest.fn(({ password, hashedPassword }) =>
            Promise.resolve(password === 'correct' && hashedPassword === 'hashed-correct')
        ),
    };

    const registry = {
        'argon2id:v1': mockStrategy,
        'current:v1': mockStrategy,
    };

    const passwordManager = new PasswordManager({
        currentStrategyKey: 'argon2id:v1',
        registry,
        hashParserFunction: mockHashParserFunction,
        verifyLastHashDateFunction: mockVerifyLastHashDateFunction,
        rehashAfterDays: 30,
    });

    it('should return isValid: true and wasRehashed: false for valid password and no rehash needed', async () => {
        const result = await passwordManager.comparePassword({
            password: 'correct',
            hashedPassword: 'some-fake-hash',
        });

        expect(result).toEqual({
            isValid: true,
            wasRehashed: false,
        });
    });

    it('should return isValid: false when password is incorrect', async () => {
        const result = await passwordManager.comparePassword({
            password: 'wrong',
            hashedPassword: 'hashed-correct',
        });

        expect(result).toEqual({
            isValid: false,
            wasRehashed: false,
        });
    });

    it('should rehash if key differs from currentStrategyKey', async () => {
        const differentStrategyParser = jest.fn(() => ({
            library: 'argon2' as TAlgoLibs,
            algorithm: 'argon2id' as TAlgorithms,
            versionConfig: 'v2', // different version
            hashed_at: new Date().toISOString(),
            rawHash: 'raw',
        }));

        const manager = new PasswordManager({
            currentStrategyKey: 'argon2id:v1',
            registry: {
                'argon2id:v1': mockStrategy,
                'argon2id:v2': mockStrategy,
            },
            hashParserFunction: differentStrategyParser,
            verifyLastHashDateFunction: mockVerifyLastHashDateFunction,
            rehashAfterDays: 30,
        });

        const result = await manager.comparePassword({
            password: 'correct',
            hashedPassword: 'some-fake-hash',
        });

        expect(result.wasRehashed).toBe(true);
        expect(result.newHash).toBeDefined();
    });
});
