import type {IPlaylistService} from "../../types/playlist.core.types.js";
import type {TDataInformation, TPlaylistDomainModel} from "../../types/playlist.domain.types.js";
import type {DeleteResult, InsertOneResult, UpdateResult} from "mongodb";
import {ObjectId} from "mongodb";


export const playlistService = (input: IPlaylistService['input']) => {
    const { playlistCollection, PlaylistModule } = input;

    const service: IPlaylistService['output'] = {
        /**
         * used to send a valid playlist object to the front end to feed the form
         * @returns {Promise<TPlaylistDomainModel>}
         */
        getDefaultPlaylist: async (): Promise<TPlaylistDomainModel> => {
            return new PlaylistModule().generateDefaultEmptyPlaylist();
        },

        /**
         * used to send a valid playlist object made from a template,
         * updated with template values before sending to the front end to feed the form
         * @returns {Promise<TPlaylistDomainModel>}
         */
        getNewPlaylistFromTemplate: async (input: { playlistTemplate: Partial<TPlaylistDomainModel> }): Promise<TPlaylistDomainModel> =>{
            return new PlaylistModule().generateNewPlaylistFromTemplate({ playlistTemplate: input});
        },

        /**
         * regular getPlaylist method to return all playlists
         */
        getPlaylist: async (): Promise<TPlaylistDomainModel[]> => {
            try {
                return await playlistCollection.find().toArray();
            } catch(error) {
                const err = error as Error;
                throw new Error(`[playlistService - getPlaylist]:', ${err.message}`);
            }
        },

        /**
         * regular postPlaylist method to insert a new playlist
         */
        postPlaylist: async (input: { playlistData: TPlaylistDomainModel; user_id: string}): Promise<InsertOneResult> => {
            try {
                const plMod = new PlaylistModule();
                const validatedPlaylist: TPlaylistDomainModel = plMod.updatePlaylist({ update: input.playlistData });

                /**
                 * As it is a creation, we need to create a new default dataInformation object
                 */
                const dataInformation: TDataInformation = plMod.createDataInformationFunction({ creator_id: input.user_id });

                return await playlistCollection.insertOne({
                    _id: new ObjectId(),
                    ...validatedPlaylist,
                    dataInformation
                });
            } catch(error) {
                const err = error as Error;
                throw new Error(`[playlistService - postPlaylist] ${err.message}`);
            }
        },

        updatePlaylist: async (input: { playlistData: TPlaylistDomainModel, playlist_id: string; user_id: string }): Promise<UpdateResult> =>{
            try {
                const plMod = new PlaylistModule();
                const validatedPlaylist: TPlaylistDomainModel = plMod.updatePlaylist({ update: input.playlistData });

                /**
                 * As it is an update, we need to update dataInformation object
                 */
                const result = await playlistCollection.updateOne(
                    { _id: new ObjectId(input.playlist_id) },
                    {
                        $set: {
                            ...validatedPlaylist,
                            "dataInformation.last_modified": new Date(),
                        },
                        $inc: { "dataInformation.updateNumber": 1 }
                    }
                );

                if (result.modifiedCount === 0) {
                    throw new Error("No updated playlist - check playlist_id");
                }

                return result;
            } catch(error) {
                const err = error as Error;
                throw new Error(`[playlistService - updatePlaylist] ${err.message}`);
            }
        },

        deletePlaylist: async (input: { playlist_id: string }): Promise<DeleteResult> => {
            try {
                return await playlistCollection.deleteOne({ _id: new ObjectId(input.playlist_id) });
            } catch(error) {
                const err = error as Error;
                throw new Error(`[playlistService - deletePlaylist] ${err.message}`);
            }
        },
    };

    return service;
}