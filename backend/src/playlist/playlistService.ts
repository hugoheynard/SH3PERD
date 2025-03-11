import type {IPlaylist} from "./classes/playlistBuilder/PlaylistBuilder";

const updateMock = {
    settings: {
        name: "Evening Chill Playlist",
        usage: "relax",
        energy: 2,
        requiredLength: 20,
        numberOfSongs: 5,
        singers: true,
        musicians: false,
        aerial: true
    },
    songList: [
        {
            _id: "song123",
            title: "Chill Vibes",
            artist: "Lofi Beats",
            version_id: "v1",
            version_length: 180,
            tags: ["lofi", "chill"]
        },
        {
            _id: "song124",
            title: "Smooth Jazz",
            artist: "Jazz Masters",
            version_id: "v2",
            version_length: 210,
            tags: ["jazz", "instrumental"]
        },
        {
            _id: "song125",
            title: "Acoustic Dreams",
            artist: "Indie Folk",
            version_id: "v3",
            version_length: 200,
            tags: ["acoustic", "folk"]
        },
        {
            _id: "song126",
            title: "Sunset Groove",
            artist: "Electronic Chill",
            version_id: "v4",
            version_length: 190,
            tags: ["electronic", "downtempo"]
        },
        {
            _id: "song127",
            title: "Ocean Waves",
            artist: "Nature Sounds",
            version_id: "v5",
            version_length: 300,
            tags: ["ambient", "nature"]
        }
    ],
    performers: {
        singersConfig: {
            quantity: 2,
            containsDuo: true,
            splitMode: "alternate"
        },
        musiciansConfig: {
            role: "guitarist"
        },
        aerialConfig: {
            performancePosition: "center stage"
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