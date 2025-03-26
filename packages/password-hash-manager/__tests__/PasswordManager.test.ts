import type {IHasherStrategy, IHashParser} from "../types/Interfaces";
import {PasswordManager} from "../src/PasswordManager";
import { jest } from '@jest/globals';


const FAKE_HASH = 'lib:::algo:::v1:::2000-01-01:::$hash$';
const PASSWORD = 'correct_password';

// 🧪 Fake hashing strategy
class MockHasher implements IHasherStrategy {
    async hashPassword(): Promise<string> {
        return FAKE_HASH;
    }

    async comparePassword(input: { password: string; hashedPassword: string }): Promise<boolean> {
        return input.password === PASSWORD;
    }
}

// 🧪 Fake parser that returns an old hash date
const mockParser: IHashParser = {
    extract: (input: string)=> {
        const [, algorithm, version, date, rawHash] = input
            .replace(/[<>]/g, '')
            .split(':');

        return {
            library: 'lib',
            algorithm,
            versionConfig: version,
            date: new Date(date),
            rawHash,
        };
    },
};

describe('PasswordManager', () => {
    it('should call onRehash if hash is too old', async () => {
        const onRehash: (newHash: string) => Promise<void> = jest.fn().mockResolvedValue(undefined);
        const verifyLastHashDateFunction = jest.fn().mockReturnValue(true);

        const manager = new PasswordManager({
            currentStrategyKey: 'algo:v1',
            registry: { 'algo:v1': new MockHasher() },
            hashParser: mockParser,
            verifyLastHashDateFunction,
            onRehash,
            rehashAfterDays: 30,
        });

        const result = await manager.comparePassword({
            password: PASSWORD,
            hashedPassword: FAKE_HASH,
        });

        expect(result).toBe(true);
        expect(verifyLastHashDateFunction).toHaveBeenCalled();
        expect(onRehash).toHaveBeenCalledWith(FAKE_HASH);
    });

    it('should not call onRehash if rehash not needed', async () => {
        const onRehash: (newHash: string) => Promise<void> = jest.fn().mockResolvedValue(undefined);
        const verifyLastHashDateFunction = jest.fn().mockReturnValue(false);

        const manager = new PasswordManager({
            currentStrategyKey: 'algo:v1',
            registry: { 'algo:v1': new MockHasher() },
            hashParser: mockParser,
            verifyLastHashDateFunction,
            onRehash,
            rehashAfterDays: 30,
        });

        const result = await manager.comparePassword({
            password: PASSWORD,
            hashedPassword: FAKE_HASH,
        });

        expect(result).toBe(true);
        expect(onRehash).not.toHaveBeenCalled();
    });

    it('should return false if password is invalid', async () => {
        const onRehash: (newHash: string) => Promise<void> = jest.fn().mockResolvedValue(undefined);
        const verifyLastHashDateFunction = jest.fn();

        const manager = new PasswordManager({
            currentStrategyKey: 'algo:v1',
            registry: { 'algo:v1': new MockHasher() },
            hashParser: mockParser,
            verifyLastHashDateFunction,
            onRehash,
            rehashAfterDays: 30,
        });

        const result = await manager.comparePassword({
            password: 'wrong_password',
            hashedPassword: FAKE_HASH,
        });

        expect(result).toBe(false);
        expect(onRehash).not.toHaveBeenCalled();
    });
});
