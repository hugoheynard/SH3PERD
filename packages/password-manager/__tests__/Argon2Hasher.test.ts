import argon2 from 'argon2';


import type {IArgon2_Options, IHasherConfigObject, IHashParser, TAlgoLibs, TAlgorithms} from '../src/types/Interfaces';
import { Argon2Hasher } from '../src/strategies/Argon2Hasher';

// 🧪 Parser réel utilisé dans la stratégie
const HashParser: IHashParser = {
    extract: (versionedHash) =>{
        const parts = versionedHash.split(':::');
        if (parts.length !== 5) {
            throw new Error(`Invalid hash format: expected 5 parts, got ${parts.length}`);
        }

        const [library, algorithm, versionConfig, hashed_at, rawHash] = parts;
        return {
            library: library as TAlgoLibs,
            algorithm: algorithm as TAlgorithms,
            versionConfig,
            hashed_at,
            rawHash };
    },
};

// 🧩 Config simulation
const config: IHasherConfigObject<IArgon2_Options> = {
    library: 'argon2',
    algorithm: 'argon2id',
    versionConfig: 'v1',
    configOptions: {
        type: argon2.argon2id,
        timeCost: 3,
        memoryCost: 1024 * 128,
        parallelism: 2,
        hashLength: 32,
    },
};

describe('Argon2Hasher', () => {
    const hasher = new Argon2Hasher({ configObject: config, hashParser: HashParser });

    it('should hash a password with versioned prefix', async () => {
        const result = await hasher.hashPassword({ password: 'secret123' });

        expect(result.startsWith('argon2:::argon2id:::v1:::')).toBe(true);

        const parts = result.split(':::');
        const rawHash = parts[4].replace(/[<>]/g, '');
        expect(rawHash.length).toBeGreaterThan(20);
        expect(rawHash.startsWith('$argon2id')).toBe(true);
    });

    it('should successfully compare a valid password', async () => {
        const hash = await hasher.hashPassword({ password: 'secret123' });

        const isValid = await hasher.comparePassword({
            password: 'secret123',
            hashedPassword: hash,
        });

        expect(isValid).toBe(true);
    });

    it('should reject an invalid password', async () => {
        const hash = await hasher.hashPassword({ password: 'secret123' });

        const isValid = await hasher.comparePassword({
            password: 'wrongpass',
            hashedPassword: hash,
        });

        expect(isValid).toBe(false);
    });

    it('should throw on malformed hash format', async () => {
        await expect(() =>
            hasher.comparePassword({
                password: 'any',
                hashedPassword: 'not:::valid:::format',
            })
        ).rejects.toThrow(/expected 5 parts/);
    });
});
