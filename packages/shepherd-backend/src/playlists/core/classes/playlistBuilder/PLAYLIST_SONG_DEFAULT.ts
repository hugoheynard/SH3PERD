import type {TPlaylistSong} from "../../../types/playlist.domain.types.js";


export const PLAYLIST_SONG_DEFAULT: Readonly<TPlaylistSong> = Object.freeze({
    _id: null,
    title: null,
    artist: null,
    version_id: null,
    version_length: null,
    tags: []
});
