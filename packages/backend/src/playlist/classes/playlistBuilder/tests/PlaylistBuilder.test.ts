import {PlaylistBuilder} from "../PlaylistBuilder";
import {PLAYLIST_SETTINGS_DEFAULT} from "../PLAYLIST_SETTINGS_DEFAULT";
import {SINGERS_CONFIG_DEFAULT} from "../SINGERS_CONFIG_DEFAULT";
import {MUSICIAN_CONFIG_DEFAULT} from "../MUSICIAN_CONFIG_DEFAULT";
import {AERIAL_CONFIG_DEFAULT} from "../AERIAL_CONFIG_DEFAULT";
import {PLAYLIST_SONG_DEFAULT} from "../PLAYLIST_SONG_DEFAULT";


describe("PlaylistBuilder", () => {
    let builder: PlaylistBuilder;

    beforeEach(() => {
        builder = new PlaylistBuilder({
            playlistSettings: PLAYLIST_SETTINGS_DEFAULT,
            singersConfig: SINGERS_CONFIG_DEFAULT,
            musiciansConfig: MUSICIAN_CONFIG_DEFAULT,
            aerialConfig: AERIAL_CONFIG_DEFAULT,
            playlistSong: PLAYLIST_SONG_DEFAULT,
        });
    });

    test("should generate a valid playlist object", () => {
        const playlist = builder.build();

        expect(playlist).toBeDefined();
        expect(playlist.settings).toEqual(PLAYLIST_SETTINGS_DEFAULT);
        expect(playlist.performers.singersConfig).toEqual(SINGERS_CONFIG_DEFAULT);
        expect(playlist.performers.musiciansConfig).toEqual(MUSICIAN_CONFIG_DEFAULT);
        expect(playlist.performers.aerialConfig).toEqual(AERIAL_CONFIG_DEFAULT);
    });

    test("should create a song list with correct number of songs", () => {
        const customSettings = { ...PLAYLIST_SETTINGS_DEFAULT, numberOfSongs: 4 };

        const builder = new PlaylistBuilder({
            playlistSettings: customSettings,
            singersConfig: SINGERS_CONFIG_DEFAULT,
            musiciansConfig: MUSICIAN_CONFIG_DEFAULT,
            aerialConfig: AERIAL_CONFIG_DEFAULT,
            playlistSong: PLAYLIST_SONG_DEFAULT,
        });

        const playlist = builder.build();

        expect(playlist.songList.length).toBe(4);
    });


});
