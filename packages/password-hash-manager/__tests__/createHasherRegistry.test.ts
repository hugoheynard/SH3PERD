import type {IHashParser, THashParserFunction} from "../types/Interfaces";
import {createHasherRegistry} from "../src/hasherRegistry/createHasherRegistry";
import { jest } from '@jest/globals';

describe('createHasherRegistry', () => {
    const mockParser: IHashParser = {
        extract: jest.fn(((_hash: string) => ({
            library: 'argon2',
            algorithm: 'argon2id',
            versionConfig: 'v1',
            hashed_at: '2025-01-01',
            rawHash: '$argon2id$example',
        })) as THashParserFunction),
    };

    it('should return a registry with the expected keys and instances', () => {
        const registry = createHasherRegistry({ hashParser: mockParser });

        expect(registry).toHaveProperty('argon2id:v1');

        const hasher = registry['argon2id:v1'];
        expect(typeof hasher.hashPassword).toBe('function');
        expect(typeof hasher.comparePassword).toBe('function');
    });

    it('should use the injected hashParser in the strategy', async () => {
        const registry = createHasherRegistry({ hashParser: mockParser });
        const hasher = registry['argon2id:v1'];

        const fakeHash = '<argon2>:<argon2id>:<v1>:<$argon2id$...>';

        try {
            await hasher.comparePassword({
                password: 'test',
                hashedPassword: fakeHash,
            });
        } catch (_) {
            // ignore expected error due to invalid hash (we're testing parser usage)
        }

        expect(mockParser.extract).toHaveBeenCalledWith(fakeHash);
    });
});
