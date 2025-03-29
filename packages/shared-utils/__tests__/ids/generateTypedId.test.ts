import {generateTypedId} from "../../src";

describe('generateTypedId', () => {
    it('should return a string with the given prefix', () => {
        const result = generateTypedId('user');

        expect(typeof result).toBe('string');
        expect(result.startsWith('user_')).toBe(true);
    });

    it('should generate different IDs on each call', () => {
        const id1 = generateTypedId('user');
        const id2 = generateTypedId('user');

        expect(id1).not.toEqual(id2);
    });

    it('should work with other prefixes', () => {
        const result = generateTypedId('session');
        expect(result.startsWith('session_')).toBe(true);
    });
});
