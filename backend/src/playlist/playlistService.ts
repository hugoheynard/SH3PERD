import type {IPlaylist} from "./classes/playlistBuilder/PlaylistBuilder";

const updateMock = {
    settings: {
        name: "Evening Chill Playlist",
        usage: "daily",
        energy: 2,
        requiredLength: 20,
        numberOfSongs: 5,
        singers: true,
        musicians: false,
        aerial: true,
    },
    performers: {
        singersConfig: {
            numberOfSingers: 3,
            containsDuo: true,
            splitMode: "alternate"
        },
        musiciansConfig: {
            role: 'support'
        },
        aerialConfig: {
            performancePosition: "end"
        }
    }
};


export const playlistService = (input) => {
    const { playlistCollection, PlaylistForm, PlaylistModule } = input;

    const service = {

        getEmptyPlaylist() {
            return new PlaylistModule().generateEmptyPlaylist();
        },

        getEmptyPlaylistFromTemplate(input: { playlistTemplate: Partial<IPlaylist> } = {}): IPlaylist {
            const { playlistTemplate } = input;

            const playlist = new PlaylistModule().generatePlaylistFromTemplate({ playlistTemplate: updateMock });

            return playlist;
        },


    };

    return service;
}