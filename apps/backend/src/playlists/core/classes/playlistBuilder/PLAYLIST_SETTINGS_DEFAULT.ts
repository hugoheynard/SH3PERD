import type {TPlaylistSettings} from "../../../types/playlist.domain.types.js";

export const PLAYLIST_SETTINGS_DEFAULT: Readonly<TPlaylistSettings> = Object.freeze({
    name: `New Playlist ${new Date().toLocaleDateString()}` as string,
    description: '',
    usage: 'daily',
    energy: 1,
    requiredLength: 15,
    numberOfSongs: 4,
    singers: false,
    musicians: false,
    aerial: false
});