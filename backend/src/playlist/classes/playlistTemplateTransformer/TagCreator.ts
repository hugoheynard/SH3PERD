import type {ISingersConfig} from "../playlistBuilder/SINGERS_CONFIG_DEFAULT";
import type {IPlaylist} from "../playlistBuilder/PlaylistBuilder";

export class TagCreator {
    private playlistToUpdate: any = {};
    private template: any = {};

    constructor(input: any = {}) {
        this.playlistToUpdate = input.playlistToUpdate;
        this.template = input.template;
    };

    applyTagsFromSingerConfig(): void {
        const singerConfig = this.singerConfig

        const { quantity, containsDuo, splitMode } = singerConfig;

        const singerTags: string[] = [];
        for (let i: number= 1; i <= quantity; i++) {
            singerTags.push(`singer-${i}`);
            this.playlistTags.push(`singer-${i}`);
        }

        if (containsDuo) {
            playlistTags.push("duo");
        }
    };

    generateTags(): IPlaylist {
        const { songList } = this.playlistToUpdate;
        const { singersConfig, musiciansConfig, aerialConfig } = this.template.performers;


        this.applyTagsFromAerialConfig({ songListToTag: songList, aerialConfig: aerialConfig});
        return this.playlistToUpdate;
    };



    applyTagsFromMusicianConfig(): void {};

    applyTagsFromAerialConfig(input: { songListToTag: any; aerialConfig: any } = {}): void {

        if(!input) return;

        const { songListToTag, aerialConfig } = input;
        const aerialTag: string = 'aerial';

        if (aerialConfig) {
            this.playlistTags.push(aerialTag);
        }

        if (aerialConfig.performancePosition === "start") {
            songListToTag[0].tags.push(aerialTag);
        }

        if (aerialConfig.performancePosition === "end") {
            songListToTag.at(-1).tags.push(aerialTag);
        }
    };
}

