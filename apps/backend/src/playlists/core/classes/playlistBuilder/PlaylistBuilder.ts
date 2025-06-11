import type {TPlaylistBuilderInput} from "../../../types/playlist.core.types.js";
import type {TPlaylistDomainModel} from "../../../types/playlist.domain.types.js";

/**
 * @class PlaylistBuilder
 *
 * This class constructs a valid musical playlist based on the provided parameters.
 * It generates a list of songs according to `playlistSettings.numberOfSongs`
 * and integrates performer configurations.
 *
 * ### Usage Example:
 *
 * ```typescript
 * const builder = new PlaylistBuilder({
 *     playlistSettings: PLAYLIST_SETTINGS_DEFAULT,
 *     singersConfig: SINGERS_CONFIG_DEFAULT,
 *     musiciansConfig: MUSICIAN_CONFIG_DEFAULT,
 *     aerialConfig: AERIAL_CONFIG_DEFAULT,
 *     playlistSong: PLAYLIST_SONG_DEFAULT,
 * });
 *
 * const playlist = builder.build();
 * console.log(playlist);
 * ```
 */
export class PlaylistBuilder {
    private readonly input: TPlaylistBuilderInput;


    /**
     * @constructor
     * @param {IPlaylistBuilderInput} input - Parameters required to construct the playlist.
     */
    constructor(input: TPlaylistBuilderInput) {
        this.input = input;
    }

    /**
     * Builds a complete `IPlaylist` object containing all necessary information.
     * @returns {IPlaylist} A fully structured playlist object.
     */
    build(): TPlaylistDomainModel {
        const { playlistSettings, singersConfig, musiciansConfig, aerialConfig, playlistSong } = this.input

        return {
            settings: playlistSettings,
            tags: [],
            songList: Array.from(
                { length: playlistSettings.numberOfSongs },
                () => ({ ...playlistSong })
            ),
            performers: {
                singersConfig: singersConfig,
                musiciansConfig: musiciansConfig,
                aerialConfig: aerialConfig,
            }
        };
    }
}
