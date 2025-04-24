import {HashParser} from "../HashParser";


describe('HashParser', () => {
    it('should correctly extract parts from a valid hash string', () => {

        const versionedHash = 'argon2:::argon2id:::v1:::2025-03-12:::$argon2id$v=19$m=65536,t=3,p=4$abc';

        const result = HashParser.extract(versionedHash);

        expect(result).toEqual({
            library: 'argon2',
            algorithm: 'argon2id',
            versionConfig: 'v1',
            hashed_at: '2025-03-12',
            rawHash: '$argon2id$v=19$m=65536,t=3,p=4$abc',
        });
    });

    it('should throw if the input does not have 5 parts', () => {
        const badHash = 'argon2:::argon2id:::v1';

        expect(() => HashParser.extract(badHash)).toThrowError(
            /expected 5 parts/
        );
    });

    it('should accept a hash that starts with any value as rawHash', () => {

        const versionedHash = `argon2:::argon2id:::v1:::2025-03-12:::not-a-real-hash`;

        const result = HashParser.extract(versionedHash);

        expect(result.rawHash).toBe('not-a-real-hash');
    });
});
