import type {IPlaylist} from "../playlistBuilder/PlaylistBuilder";
import type {IAerialConfig} from "../playlistBuilder/AERIAL_CONFIG_DEFAULT";
import type {IPlaylistSong} from "../playlistBuilder/PLAYLIST_SONG_DEFAULT";

export interface ISubTagCreatorsReturns {
    playlistTags: string[];
    songListTags: string[];
}

export class TagCreator {
    private errors: any;


    constructor() {};

    generateTags(input: { playlistToTag: IPlaylist }): IPlaylist {
        const { playlistToTag } = input;
        const { songList } = songList;
        const { singersConfig, musiciansConfig, aerialConfig } = playlistToTag.performers;

        this.applyTagsFromSingerConfig({ singersConfig }, { numberOfSongs: songList.length });
        this.applyTagsFromAerialConfig({ songListToTag: songList, aerialConfig: aerialConfig});

    };

    applyTagsFromSingerConfig({ singerConfig }, input: { numberOfSongs: number }): ISubTagCreatorsReturns {
        const { quantity, containsDuo, splitMode } = singerConfig;

        const tagObject = this.createSubTagObject();

        for (let i: number= 1; i <= quantity; i++) {
            tagObject.playlistTags.push(`singer-${i}`);
        }

        if (containsDuo) {
            tagObject.playlistTags.push("duo");
        }

        if (splitMode === 'alternate') {
            tagObject.songListTags.push(splitMode);
        }

        if (splitMode === 'alternate' && input.numberOfSongs > 0) {
            let index: number = 0;
            for (const song of songList) {
                const assignedSinger: string = `singer-${(index % quantity) + 1}`;
                if (!song.tags) {
                    song.tags = [];
                }
                song.tags.push(assignedSinger);
                index++;
            }
        }

        return tagObject;
    };

    createSubTagObject(): ISubTagCreatorsReturns {
        return {
            playlistTags: [],
            songListTags: []
        };

    }



    applyTagsFromMusicianConfig(): void {};

    applyTagsFromAerialConfig(input: { songListToTag: IPlaylistSong[]; aerialConfig: IAerialConfig } = {}): void {

        if (input === undefined) return;

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

