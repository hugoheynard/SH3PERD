import {PlaylistTagGenerator} from "../PlaylistTagGenerator.js";

class TestablePlaylistTagGenerator extends PlaylistTagGenerator<{ testKey: string }> {
    private shouldThrowError = false;

    public exposeResetTagObject() {
        this.resetTagObject();
    }

    public exposeGetTagObject() {
        return this.getTagObject();
    }

    public exposeGenerate(input: { testKey: string }) {
        return this.generate(input);
    }

    protected execute(input: { testKey: string }): void {
        if (this.shouldThrowError) {
            throw new Error("Simulated execute error");
        }
        this.tagObject.playlistTags.push(`test-${input.testKey}`);
    }

    public triggerErrorOnExecute() {
        this.shouldThrowError = true;
    }
}

describe("PlaylistTagGenerator", () => {
    let generator: TestablePlaylistTagGenerator;

    beforeEach(() => {
        generator = new TestablePlaylistTagGenerator();
    });

    test("should retrieve the correct tag object", () => {
        (generator as any).tagObject = {
            playlistTags: ["rock", "pop"],
            songListTags: [["song1"], ["song2"]],
        };

        expect(generator.exposeGetTagObject()).toEqual({
            playlistTags: ["rock", "pop"],
            songListTags: [["song1"], ["song2"]],
        });
    });

    test("should reset tag object correctly", () => {
        (generator as any).tagObject = {
            playlistTags: ["jazz"],
            songListTags: [["songA"], ["songB"]],
        };

        generator.exposeResetTagObject();

        expect(generator.exposeGetTagObject()).toEqual({
            playlistTags: [],
            songListTags: [],
        });
    });

    test("should generate correctly when execute works", () => {
        const result = generator.exposeGenerate({ testKey: "123" });

        expect(result).toEqual({
            playlistTags: ["test-123"],
            songListTags: [],
        });

        // Vérifie que `tagObject` a bien été reset après `generate()`
        expect(generator.exposeGetTagObject()).toEqual({
            playlistTags: [],
            songListTags: [],
        });
    });

    test("should throw an error when execute fails", () => {
        generator.triggerErrorOnExecute(); // Active l'erreur simulée dans execute()

        expect(() => generator.exposeGenerate({ testKey: "error" })).toThrow("Error while generating tags");
    });

    test("should keep the original error message", () => {
        generator.triggerErrorOnExecute(); // Active l'erreur

        try {
            generator.exposeGenerate({ testKey: "error" });
        } catch (error) {
            expect((error as Error).message).toContain("Error while generating tags");
            expect((error as Error).message).toContain("Simulated execute error");
        }
    });
});
