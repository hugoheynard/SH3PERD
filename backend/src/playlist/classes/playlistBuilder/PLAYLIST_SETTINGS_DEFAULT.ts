export interface IPlaylistSettings {
    name: string;
    description: string;
    usage: 'daily' | 'event';
    tags: string[];
    energy: 1 | 2 | 3 | 4;
    requiredLength: number;
    numberOfSongs: number;
    singers: boolean;
    musicians: boolean;
    aerial: boolean;
}

export const PLAYLIST_SETTINGS_DEFAULT: Readonly<IPlaylistSettings> = Object.freeze({
    name: `New Playlist ${new Date().toLocaleDateString()}` as string,
    description: '',
    usage: 'daily',
    tags: [],
    energy: 1,
    requiredLength: 15,
    numberOfSongs: 4,
    singers: false,
    musicians: false,
    aerial: false
});