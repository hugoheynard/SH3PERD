import {type ISubTagCreatorsReturns, PlaylistTagGenerator} from "./PlaylistTagGenerator";
import type {IAerialConfig} from "../playlistBuilder/AERIAL_CONFIG_DEFAULT";

export class AerialTagGenerator extends PlaylistTagGenerator<{ aerialConfig: IAerialConfig; numberOfSongs: number }> {
    private aerialConfig: IAerialConfig = {} as IAerialConfig;
    private numberOfSongs: number = 0;

    public generate(input: { aerialConfig: IAerialConfig; numberOfSongs: number }): ISubTagCreatorsReturns {
        return super.generate(input);
    };

    protected execute(input: { aerialConfig: IAerialConfig; numberOfSongs: number }): void {
        try {
            this.initData(input);
            this.managePlaylistTags();
            this.tagPerformancePosition();
        } catch(error) {
            console.error(`[AerialTagGenerator - execute]: Error generating aerial tags: ${error}`);
        }
    };

    initData(input: { aerialConfig: IAerialConfig; numberOfSongs: number }): void {

            if (!input.aerialConfig) {
                throw new Error("[AerialTagGenerator - initData]: No aerial configuration provided.");
            }
            this.aerialConfig = input.aerialConfig;

            if (!input.numberOfSongs) {
                throw new Error("[AerialTagGenerator - initData]: No number of songs provided.");
            }
            this.numberOfSongs = input.numberOfSongs;
    };

    managePlaylistTags(): void {};

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