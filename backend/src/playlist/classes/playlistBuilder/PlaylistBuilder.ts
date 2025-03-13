import type {IPlaylistSettings} from "./PLAYLIST_SETTINGS_DEFAULT";
import type {ISingersConfig} from "./SINGERS_CONFIG_DEFAULT";
import type {IMusicianConfig} from "./MUSICIAN_CONFIG_DEFAULT";
import type {IAerialConfig} from "./AERIAL_CONFIG_DEFAULT";
import type {IPlaylistSong, PlaylistSong} from "./PLAYLIST_SONG_DEFAULT";


export interface IPlaylist {
    settings: IPlaylistSettings,
    songList: IPlaylistSong[],
    performers: {
        singersConfig: ISingersConfig,
        musiciansConfig: IMusicianConfig,
        aerialConfig: IAerialConfig,
    }
}

interface IPlaylistBuilderInput {
    playlistSettings: IPlaylistSettings,
    singersConfig: ISingersConfig,
    musiciansConfig: IMusicianConfig,
    aerialConfig: IAerialConfig,
    playlistSong: typeof PlaylistSong
}

/**
 * @class PlaylistBuilder
 * builds a new playlist object
 */

export class PlaylistBuilder {
    private readonly playlistSettings: IPlaylistSettings;
    private readonly singersConfig: ISingersConfig;
    private readonly musiciansConfig: IMusicianConfig;
    private readonly aerialConfig: IAerialConfig;
    private playlistSong: IPlaylistSong;

    constructor(input: IPlaylistBuilderInput) {
        this.playlistSettings = input.playlistSettings;
        this.singersConfig = input.singersConfig;
        this.musiciansConfig = input.musiciansConfig;
        this.aerialConfig = input.aerialConfig;
        this.playlistSong = input.playlistSong;
    };

    build(): IPlaylist {
        return {
            settings: this.playlistSettings,
            songList: Array.from(
                { length: this.playlistSettings.numberOfSongs },
                (_, i) => this.playlistSong),
            performers: {
                singersConfig: this.singersConfig,
                musiciansConfig: this.musiciansConfig,
                aerialConfig: this.aerialConfig,
            }
        };
    };
}