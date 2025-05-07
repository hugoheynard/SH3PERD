import {ISubTagCreatorsReturns, PlaylistTagGenerator} from "./PlaylistTagGenerator.js";
import type {TAerialConfig} from "@sh3pherd/shared-types";


/**
 * Class responsible for generating tags for an aerial playlist.
 * Inherits from `PlaylistTagGenerator` and utilizes `IAerialConfig` for tag configuration.
 */
export class AerialTagGenerator extends PlaylistTagGenerator<{ aerialConfig: IAerialConfig; numberOfSongs: number }> {
    /**
     * Aerial configuration used to generate tags.
     */
    private aerialConfig: IAerialConfig = {} as TAerialConfig;
    /**
     * Total number of songs in the playlist.
     */
    private numberOfSongs: number = 0;

    /**
     * Generates tags based on the provided input.
     *
     * @param {Object} input - The input parameters.
     * @param {IAerialConfig} input.aerialConfig - The aerial configuration for tag generation.
     * @param {number} input.numberOfSongs - The number of songs in the playlist.
     * @returns {ISubTagCreatorsReturns} - The generated tag results.
     */
    public generate(input: { aerialConfig: TAerialConfig; numberOfSongs: number }): ISubTagCreatorsReturns {
        return super.generate(input);
    };

    /**
     * Executes the tag generation process for the aerial playlist.
     *
     * @param {Object} input - The input parameters.
     * @param {IAerialConfig} input.aerialConfig - The aerial configuration.
     * @param {number} input.numberOfSongs - The number of songs to tag.
     */
    protected execute(input: { aerialConfig: TAerialConfig; numberOfSongs: number }): void {
        try {
            this.initData(input);
            this.managePlaylistTags();
            this.tagPerformancePosition();
        } catch(error) {
            console.error(`[AerialTagGenerator - execute]: Error generating aerial tags: ${error}`);
        }
    };

    /**
     * Initializes the internal data based on the provided input.
     * Ensures that `aerialConfig` and `numberOfSongs` are correctly assigned.
     *
     * @param {Object} input - The input parameters.
     * @param {IAerialConfig} input.aerialConfig - The aerial configuration.
     * @param {number} input.numberOfSongs - The number of songs in the playlist.
     * @throws {Error} Throws an error if `aerialConfig` or `numberOfSongs` is missing.
     */
    initData(input: { aerialConfig: TAerialConfig; numberOfSongs: number }): void {

            if (!input.aerialConfig) {
                throw new Error("[AerialTagGenerator - initData]: No aerial configuration provided.");
            }
            this.aerialConfig = input.aerialConfig;

            if (!input.numberOfSongs) {
                throw new Error("[AerialTagGenerator - initData]: No number of songs provided.");
            }
            this.numberOfSongs = input.numberOfSongs;
    };

    /**
     * Manages the playlist tags. This method should be implemented in subclasses if needed.
     */
    managePlaylistTags(): void {};

    /**
     * Assigns tags to songs based on the `performancePosition` defined in `aerialConfig`.
     *
     * If `performancePosition` is `"start"`, the first song gets the `"aerial"` tag.
     * If `"end"`, the last song gets the `"aerial"` tag.
     * If `"manual"`, the playlist gets a general `"aerial"` tag.
     */
    tagPerformancePosition(): void {
        try {
            const { performancePosition } = this.aerialConfig;

            for (let i = 0; i < this.numberOfSongs; i++) {
                this.tagObject.songListTags.push([]);
            }

            if (performancePosition === 'start') {
                this.tagObject.songListTags[0].push('aerial');
                this.tagObject.playlistTags.push('aerial');
            }

            if (performancePosition === 'end') {
                this.tagObject.songListTags[this.numberOfSongs - 1].push('aerial');
                this.tagObject.playlistTags.push('aerial');
            }

            if (performancePosition === 'manual') {
                this.tagObject.playlistTags.push('aerial');
            }

        } catch(error) {
            console.error(`[AerialTagGenerator - tagPerformancePosition]: Error tagging performance position: ${error}`);
        }
    };

}