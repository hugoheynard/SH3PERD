import {PlaylistTagGenerator} from "./PlaylistTagGenerator";
import type {IAerialConfig} from "../playlistBuilder/AERIAL_CONFIG_DEFAULT";
import type {ISubTagCreatorsReturns} from "./TagCreator";

export class AerialTagGenerator extends PlaylistTagGenerator<{ aerialConfig: IAerialConfig; numberOfSongs: number }> {
    private aerialConfig: IAerialConfig;
    private numberOfSongs: number;

    public generate(input: { aerialConfig: IAerialConfig; numberOfSongs: number }): ISubTagCreatorsReturns {
        return super.generate(input);
    };

    protected execute(input: { aerialConfig: IAerialConfig; numberOfSongs: number }): void {
        try {
            if (!input.aerialConfig) {
                return;
            }
            this.initData(input);
            this.managePlaylistTags();
            this.tagPerformancePosition();
        } catch(error) {
            console.error(`[AerialTagGenerator - execute]: Error generating aerial tags: ${error}`);
        }
    };

    initData(input: { aerialConfig: IAerialConfig; numberOfSongs: number }): void {
        try {
            if (!input.aerialConfig) {
                throw new Error("No aerial configuration provided.");
            }
            this.aerialConfig = input.aerialConfig;

            if (!input.numberOfSongs) {
                throw new Error("No number of songs provided.");
            }
            this.numberOfSongs = input.numberOfSongs;
        } catch(error) {
            console.error(`[AerialTagGenerator - initData]: Error initializing data: ${error}`);
        }
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

            if (perormancePosition === 'manual') {
                this.tagObject.playlistTags.push('aerial');
            }

        } catch(error) {
            console.error(`[AerialTagGenerator - tagPerformancePosition]: Error tagging performance position: ${error}`);
        }
    };

}