import {AerialTagGenerator} from "../AerialTagGenerator";
import {IAerialConfig} from "../../playlistBuilder/AERIAL_CONFIG_DEFAULT";

describe("AerialTagGenerator", () => {
    let aerialTagGenerator: AerialTagGenerator;
    let mockAerialConfig: IAerialConfig;

    beforeEach(() => {
        // Simule un config de test
        mockAerialConfig = {
            performancePosition: "start", // Changeable pour tester différents cas
        } as IAerialConfig;

        // Instancie l'objet à tester
        aerialTagGenerator = new AerialTagGenerator();
    });

    it("should initialize aerialConfig and numberOfSongs correctly", () => {
        expect(aerialTagGenerator).toBeDefined();
        expect((aerialTagGenerator as any).aerialConfig).toBeDefined();
        expect((aerialTagGenerator as any).numberOfSongs).toBeDefined();
    });

    it("should correctly initialize data with valid input", () => {
        const input = { aerialConfig: mockAerialConfig, numberOfSongs: 5 };

        (aerialTagGenerator as any).initData(input);

        expect((aerialTagGenerator as any).aerialConfig).toEqual(mockAerialConfig);
        expect((aerialTagGenerator as any).numberOfSongs).toBe(5);
    });

    it("should throw an error if aerialConfig is missing in initData", () => {
        expect(() => (aerialTagGenerator as any).initData({ aerialConfig: undefined, numberOfSongs: 5 }))
            .toThrow("[AerialTagGenerator - initData]: No aerial configuration provided.");
    });

    it("should throw an error if numberOfSongs is missing in initData", () => {
        expect(() => (aerialTagGenerator as any).initData({ aerialConfig: mockAerialConfig, numberOfSongs: undefined }))
            .toThrow("[AerialTagGenerator - initData]: No number of songs provided.");
    });

    it("should execute and call necessary methods", () => {
        const input = { aerialConfig: mockAerialConfig, numberOfSongs: 3 };

        const spyInitData = jest.spyOn(aerialTagGenerator as any, "initData");
        const spyManagePlaylistTags = jest.spyOn(aerialTagGenerator as any, "managePlaylistTags");
        const spyTagPerformancePosition = jest.spyOn(aerialTagGenerator as any, "tagPerformancePosition");

        (aerialTagGenerator as any).execute(input);

        expect(spyInitData).toHaveBeenCalledWith(input);
        expect(spyManagePlaylistTags).toHaveBeenCalled();
        expect(spyTagPerformancePosition).toHaveBeenCalled();
    });

    it("should tag performance position correctly", () => {
        const input = { aerialConfig: mockAerialConfig, numberOfSongs: 3 };

        (aerialTagGenerator as any).initData(input);
        (aerialTagGenerator as any).tagObject = { songListTags: [], playlistTags: [] };

        (aerialTagGenerator as any).tagPerformancePosition();

        expect((aerialTagGenerator as any).tagObject.songListTags[0]).toContain("aerial");
        expect((aerialTagGenerator as any).tagObject.playlistTags).toContain("aerial");
    });

    it("should handle performancePosition = 'end' correctly", () => {
        mockAerialConfig.performancePosition = "end";
        const input = { aerialConfig: mockAerialConfig, numberOfSongs: 3 };

        (aerialTagGenerator as any).initData(input);
        (aerialTagGenerator as any).tagObject = { songListTags: [[], [], []], playlistTags: [] };

        (aerialTagGenerator as any).tagPerformancePosition();

        expect((aerialTagGenerator as any).tagObject.songListTags[2]).toContain("aerial");
        expect((aerialTagGenerator as any).tagObject.playlistTags).toContain("aerial");
    });

    it("should handle performancePosition = 'manual' correctly", () => {
        mockAerialConfig.performancePosition = "manual";
        const input = { aerialConfig: mockAerialConfig, numberOfSongs: 3 };

        (aerialTagGenerator as any).initData(input);
        (aerialTagGenerator as any).tagObject = { songListTags: [[], [], []], playlistTags: [] };

        (aerialTagGenerator as any).tagPerformancePosition();

        expect((aerialTagGenerator as any).tagObject.playlistTags).toContain("aerial");
    });

    it("should log an error if execute fails", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        (aerialTagGenerator as any).execute({ aerialConfig: undefined, numberOfSongs: 3 });

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining("[AerialTagGenerator - execute]: Error generating aerial tags:")
        );

        consoleSpy.mockRestore();
    });
});
