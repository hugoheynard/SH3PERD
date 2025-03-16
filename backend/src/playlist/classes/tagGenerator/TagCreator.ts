import type {IPlaylist} from "../playlistBuilder/PlaylistBuilder";


export class TagCreator {
    private errors: any;
    private readonly generateSingersTags: any;
    private readonly generateAerialTags: any;

    constructor(input: any) {
        this.generateSingersTags = input.generateSingersTags;
        this.generateAerialTags = input.generateAerialTags;
    }

    generateTags(input: { playlistToTag: IPlaylist }): IPlaylist {
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


        console.log('aerialTags', singerTags);
    };
}

