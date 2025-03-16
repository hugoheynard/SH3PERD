import type {ISingersConfig} from "../playlistBuilder/SINGERS_CONFIG_DEFAULT";
import type {ISubTagCreatorsReturns} from "./TagCreator";
import {PlaylistTagGenerator} from "./PlaylistTagGenerator";


export class SingersTagGenerator extends PlaylistTagGenerator<{ singersConfig: ISingersConfig; numberOfSongs: number }> {
    private numberOfSongs: number;
    private singersConfig: ISingersConfig;

    /**
     * Generates tags for a playlist based on the singers' configuration.
     * @param input - Object containing the singers' configuration and the number of songs.
     * @returns Generated tags for the playlist and the song list.
     */
    public generate(input: { singersConfig: ISingersConfig; numberOfSongs: number }): ISubTagCreatorsReturns {
        return super.generate(input);
    };

    protected execute(input: { singersConfig: ISingersConfig; numberOfSongs: number }): void {
        try {
            this.initData(input);
            this.managePlaylistTags({ singersConfig: this.singersConfig });
            this.manageSplitMode({
                numberOfSingers: this.singersConfig.numberOfSingers,
                numberOfSongs: this.numberOfSongs,
                splitMode: this.singersConfig.splitMode
            });
        } catch(error) {
            console.error(`[SingersTagGenerator - execute]: Error generating singer tags: ${error}`);
        }
    };

    /**
     * Initializes class properties with the provided input values.
     * @param input - Object containing the singers' configuration and the number of songs.
     */
    private initData(input: { singersConfig: ISingersConfig ; numberOfSongs: number}): void {
        try {
            if(!input.singersConfig) {
                throw new Error("No singers' configuration provided.");
            }
            this.singersConfig = input.singersConfig;

            if(!input.numberOfSongs) {
                throw new Error("No number of songs provided.");
            }
            this.numberOfSongs = input.numberOfSongs;
        } catch(error) {
            console.error(`[SingersTagGenerator - initData]: Error initializing data: ${error}`);
        }
    };

    /**
     * Generates general playlist tags based on the singers' configuration.
     * @param input singerConfig object containing the singers' configuration.
     */
    private managePlaylistTags(input: { singersConfig: ISingersConfig }): void {
        try{
            const { numberOfSingers , containsDuo, splitMode } = input.singersConfig;

            // Create tags for singers in playlistTags
            for (let i: number= 1; i <= numberOfSingers; i++) {
                this.tagObject.playlistTags.push(`singer-${i}`);
            }

            if (containsDuo) {
                this.tagObject.playlistTags.push("duo");
            }

            if (splitMode) {
                this.tagObject.playlistTags.push(splitMode);
            }

        } catch(error) {
            console.error(`[SingersTagGenerator - managePlaylistTags]: Error generating playlist tags: ${error}`);
        }
    };

    /**
     * Applies the chosen split mode to distribute songs among singers.
     * @param input - Object containing the number of singers, number of songs, and the split mode.
     */
    private manageSplitMode(input: { numberOfSingers: number; numberOfSongs: number; splitMode: string }): void {
        const { splitMode , numberOfSingers, numberOfSongs} = input;

        if (splitMode === 'half_split') {
            this.equalSplit({ numberOfSingers: numberOfSingers, numberOfSongs: numberOfSongs });
            return;
        }

        if (splitMode === 'alternate') {
            this.alternateSplit({ numberOfSingers: numberOfSingers, numberOfSongs: numberOfSongs });
            return;
        }
    };

    /**
     * Distributes songs alternately among singers.
     * @param input - Object containing the number of singers and the number of songs.
     */
    private alternateSplit(input: { numberOfSingers: number; numberOfSongs: number; }): void {
        const { numberOfSingers, numberOfSongs} = input;

        for (let i: number= 0; i < numberOfSongs; i++) {
            const assignedSinger: string = `singer-${(i % numberOfSingers) + 1}`;
            this.tagObject.songListTags.push([assignedSinger]);
        }
    };

    /**
     * Distributes songs in consecutive blocks among singers.
     * @param input - Object containing the number of singers and the number of songs.
     */
    private equalSplit(input: { numberOfSingers: number; numberOfSongs: number; }): void {
        const { numberOfSingers, numberOfSongs} = input;

        let groupSize: number = Math.floor(numberOfSongs / numberOfSingers);
        let remainder: number = numberOfSongs % numberOfSingers;

        for (let i = 0; i < numberOfSingers; i++) {
            let numSongs = groupSize + (i < remainder ? 1 : 0);

            for (let j = 0; j < numSongs; j++) {
                this.tagObject.songListTags.push([`singer-${i + 1}`]);
            }
        }
    };

}