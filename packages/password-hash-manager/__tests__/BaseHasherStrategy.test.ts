import type {IHasherConfigObject, IHashParser, TAlgoLibs, TAlgorithms} from "../src/types/Interfaces";
import {BaseHasherStrategy} from "../src/strategies/BaseHasherStrategy";


describe("BaseHasherStrategy", () => {
    const mockConfig: IHasherConfigObject<any> = {
        library: "testlib",
        algorithm: "testalgo",
        versionConfig: "v1",
        configOptions: {}
    };

    const mockParser: IHashParser = {
        extract: (input ) => ({
            library: "testlib" as TAlgoLibs,
            algorithm: "testalgo" as TAlgorithms,
            versionConfig: "v1",
            hashed_at: '2025-12-31',
            rawHash: input
        }),
    };

    // Minimal concrete class for testing the abstract base
    class TestHasher extends BaseHasherStrategy<any> {
        async hashPassword(): Promise<string> {
            throw new Error("not implemented");
        }

        async comparePassword(): Promise<boolean> {
            throw new Error("not implemented");
        }

        // Expose protected method for testing
        public formatHashPublic(realHash: string): string {
            return this.formatHash(realHash);
        }
    }

    it("should format hash with metadata correctly", () => {
        const strategy = new TestHasher({
            configObject: mockConfig,
            hashParser: mockParser,
        });

        const realHash = "$hashed";
        const formatted = strategy.formatHashPublic(realHash);

        const today = new Date().toISOString().split("T")[0];
        const expected = `testlib:::testalgo:::v1:::${today}:::$hashed`;

        expect(formatted).toBe(expected);
    });
});
