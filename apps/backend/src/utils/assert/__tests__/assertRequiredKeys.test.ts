import {assertRequiredKeys} from "../assertRequiredKeys.js";


describe('assertRequiredKeys', () => {
    it('should not throw if all required keys are present and are functions', () => {
        const input = {
            a: () => {},
            b: () => {},
        };

        expect(() =>
            assertRequiredKeys<typeof input>(input, ['a', 'b'], 'TestDeps')
        ).not.toThrow();
    });

    it('should throw if a required key is missing', () => {
        const input = {
            a: () => {},
        };

        expect(() =>
            assertRequiredKeys<{ a: () => void; b: () => void }>(input, ['a', 'b'], 'TestDeps')
        ).toThrow(/Missing or invalid dependency "b"/);
    });

    it('should throw if a key is present but not a function', () => {
        const input = {
            a: () => {},
            b: 42,
        };

        expect(() =>
            assertRequiredKeys<{ a: () => void; b: () => void }>(input, ['a', 'b'], 'TestDeps')
        ).toThrow(/Missing or invalid dependency "b"/);
    });

    it('should throw if input is not an object', () => {
        expect(() =>
            assertRequiredKeys<any>(null, ['a'], 'NullInput')
        ).toThrow(/Expected NullInput to be a non-null object/);

        expect(() =>
            assertRequiredKeys<any>('string', ['a'], 'StringInput')
        ).toThrow(/Expected StringInput to be a non-null object/);
    });
});
