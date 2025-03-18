import type {IPlaylist} from "./classes/playlistBuilder/PlaylistBuilder";


export interface IPlaylistService {
    input: {
        playlistCollection: any;
        PlaylistForm: any;
        PlaylistModule: any;
    },
    output: {
        getDefaultPlaylist: () => Promise<IPlaylist>;
        getNewPlaylistFromTemplate: (input: { playlistTemplate: Partial<IPlaylist> }) => IPlaylist;
    }
}


export const playlistService = (input: IPlaylistService['input']) => {
    const { playlistCollection, PlaylistForm, PlaylistModule } = input;

    const service: IPlaylistService['output'] = {

        async getDefaultPlaylist() {
            return new PlaylistModule().generateDefaultEmptyPlaylist();
        },

        async getNewPlaylistFromTemplate(input) {
            return new PlaylistModule()
                .generateNewPlaylistFromTemplate(
                    {
                        playlistTemplate: input
                    });
        },
    };

    return service;
}