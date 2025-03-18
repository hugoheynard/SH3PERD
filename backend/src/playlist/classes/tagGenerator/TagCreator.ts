import type {IPlaylist} from "../playlistBuilder/PlaylistBuilder";
import type {ISubTagCreatorsReturns} from "./PlaylistTagGenerator";


export class TagCreator {
    private readonly generateSingersTags: () => any;
    private readonly generateAerialTags: () => any;
    private readonly tagMerger: any;

    constructor(input: any) {
        this.generateSingersTags = input.generateSingersTags;
        this.generateAerialTags = input.generateAerialTags;
        this.tagMerger = input.tagMerger;
    }

    tag(input: { playlistToTag: IPlaylist }): IPlaylist {
        const { playlistToTag } = input;

        const tags = this.generateTags({ playlistToTag });

        return this.applyTags({ playlistToUpdate: playlistToTag, tags });
    };

    generateTags(input: { playlistToTag: IPlaylist }): ISubTagCreatorsReturns {
        try {
            const { playlistToTag } = input;
            const { numberOfSongs } = playlistToTag.settings;
            const { singersConfig, musiciansConfig, aerialConfig } = playlistToTag.performers;

            const singerTags = this.generateSingersTags({
                singersConfig: singersConfig,
                numberOfSongs: numberOfSongs
            });

            const aerialTags = this.generateAerialTags({
                aerialConfig: aerialConfig,
                numberOfSongs: numberOfSongs
            });

            const mergeResult = this.tagMerger({ objectsToMerge: [singerTags, aerialTags] });

            return mergeResult
        } catch (error) {
            throw new Error(`[PlaylistTagCreator - generateTags]: ${error.message}`);
        }
    };

    applyTags(input: { playlistToUpdate: IPlaylist, tags: ISubTagCreatorsReturns }): IPlaylist {
        try{
            const { playlistToUpdate, tags } = input;

            const updatedPlaylist: IPlaylist = {
                settings: playlistToUpdate.settings,
                tags: tags.playlistTags,
                songList: playlistToUpdate.songList.map((song, index) => {
                    return {
                        ...song,
                        tags: tags.songListTags[index]
                    }
                }),
                performers: {
                    singersConfig: playlistToUpdate.performers.singersConfig,
                    musiciansConfig: playlistToUpdate.performers.musiciansConfig,
                    aerialConfig: playlistToUpdate.performers.aerialConfig
                }
            };

            return updatedPlaylist;
        } catch(error) {
            throw new Error(`[PlaylistTagCreator - applyTags]: ${error.message}`);
        }
    };
}

