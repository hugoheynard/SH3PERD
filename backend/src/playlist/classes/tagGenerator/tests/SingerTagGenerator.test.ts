import {SingersTagGenerator} from "../SingersTagGenerator";
import {ISingersConfig} from "../../playlistBuilder/SINGERS_CONFIG_DEFAULT";
import {ISubTagCreatorsReturns} from "../PlaylistTagGenerator";

describe("SingersTagGenerator", () => {
    let generator: SingersTagGenerator;

    beforeEach(() => {
        generator = new SingersTagGenerator();
    });

    test("should generate correct playlist tags", () => {
        const input: { singersConfig: ISingersConfig; numberOfSongs: number } = {
            singersConfig: { quantity: 3, containsDuo: true, splitMode: "alternate" },
            numberOfSongs: 10,
        };

        const result: ISubTagCreatorsReturns = generator.generate(input);

        expect(result.playlistTags).toEqual(["singer-1", "singer-2", "singer-3", "duo", "alternate"]);
    });

    test("should distribute songs correctly in alternate mode", () => {
        const input: { singersConfig: ISingersConfig; numberOfSongs: number } = {
            singersConfig: { quantity: 2, containsDuo: false, splitMode: "alternate" },
            numberOfSongs: 4,
        };

        const result: ISubTagCreatorsReturns = generator.generate(input);

        expect(result.songListTags).toEqual([
            ["singer-1"],
            ["singer-2"],
            ["singer-1"],
            ["singer-2"],
        ]);
    });

    test("should distribute songs correctly in half_split mode", () => {
        const input: { singersConfig: ISingersConfig; numberOfSongs: number } = {
            singersConfig: { quantity: 2, containsDuo: false, splitMode: "half_split" },
            numberOfSongs: 5,
        };

        const result: ISubTagCreatorsReturns = generator.generate(input);

        expect(result.songListTags).toEqual([
            ["singer-1"],
            ["singer-1"],
            ["singer-1"],
            ["singer-2"],
            ["singer-2"],
        ]);
    });

    test("should reset tags after calling generate", () => {
        const input: { singersConfig: ISingersConfig; numberOfSongs: number } = {
            singersConfig: { quantity: 2, containsDuo: true, splitMode: "alternate" },
            numberOfSongs: 6,
        };

        generator.generate(input);

        // Après génération, un nouvel appel doit repartir de zéro
        expect(generator["tagObject"]).toEqual({ playlistTags: [], songListTags: [] });
    });
});
