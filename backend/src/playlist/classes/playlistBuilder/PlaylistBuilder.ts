import type {IPlaylistSettings, PlaylistSettings} from "../PlaylistSettings";
import type {ISingersConfig, SingersConfig} from "./SingersConfig";
import type {IMusicianConfig, MusicianConfig} from "./MusicianConfig";
import type {AerialConfig, IAerialConfig} from "./AerialConfig";
import type {IPlaylistSong, PlaylistSong} from "./PlaylistSong";


export interface IPlaylist {
    settings: IPlaylistSettings,
    songList: any[],
    performers: {
        singersConfig: ISingersConfig,
        musiciansConfig: IMusicianConfig,
        aerialConfig: IAerialConfig,
    }
}

/**
 * @class PlaylistBuilder
 * builds a new playlist object
 */

export class PlaylistBuilder {
    private playlistSettings: PlaylistSettings;
    private singersConfig: SingersConfig;
    private musiciansConfig: MusicianConfig;
    private aerialConfig: AerialConfig;
    private playlistSong: PlaylistSong;

    constructor(input: any) {
        this.playlistSettings = input.playlistSettings;
        this.singersConfig = input.singersConfig;
        this.musiciansConfig = input.musiciansConfig;
        this.aerialConfig = input.aerialConfig;
        this.playlistSong = input.playlistSong;
    };

    build(): IPlaylist {
        const settings:IPlaylistSettings = this.playlistSettings.createDefault();
        const songList:IPlaylistSong[] = Array.from({ length: settings.numberOfSongs }, (_, i) => this.playlistSong.createDefault());

        return {
            settings: settings,
            songList: songList,
            performers: {
                singersConfig: this.singersConfig.createDefault(),
                musiciansConfig: this.musiciansConfig.createDefault(),
                aerialConfig: this.aerialConfig.createDefault(),
            }
        }
    };
}