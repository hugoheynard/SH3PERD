import type {IPlaylist} from "./classes/playlistBuilder/PlaylistBuilder";
import type {IDataInformation} from "./classes/DataInformationManager";


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

        /**
         * used to send a valid playlist object to the front end to feed the form
         * @returns {Promise<IPlaylist>}
         */
        async getDefaultPlaylist() {
            return new PlaylistModule().generateDefaultEmptyPlaylist();
        },

        /**
         * used to send a valid playlist object made from a template,
         * updated with template values before sending to the front end to feed the form
         * @returns {Promise<IPlaylist>}
         */
        async getNewPlaylistFromTemplate(input) {
            return new PlaylistModule()
                .generateNewPlaylistFromTemplate(
                    {
                        playlistTemplate: input
                    });
        },

        /**
         * regular getPlaylist method to return all playlists
         */

        getPlaylist: async () => {
            try {
                return await playlistCollection.find().toArray();
            } catch(error) {
                throw new Error('[playlistService - getPlaylist]:', error);
            }
        },

        /**
         * regular postPlaylist method to insert a new playlist
         */
        async postPlaylist(input) {
            try {
                const plMod = new PlaylistModule();
                const validatedPlaylist: IPlaylist = plMod.updatePlaylist({
                    update: input.playlistData
                });
                const dataInformation: IDataInformation = plMod.manageDataInformation(
                    {
                        playlist: validatedPlaylist,
                        creator_id: input.creator_id
                    });
                return await playlistCollection.insertOne({
                    ...validatedPlaylist,
                    dataInformation
                });
            } catch(error) {
                console.error('[playlistService - postPlaylist] Error:', error);
                throw new Error(`[playlistService - postPlaylist] ${error.message}`);
            }
        }
    };

    return service;
}