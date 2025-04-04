import type {IPlaylist} from "@sh3pherd/backend/playlist/classes/playlistBuilder/PlaylistBuilder";
import type {IDataInformation} from "@sh3pherd/backend/playlist/classes/DataInformationManager";
import type {IPlaylistService} from "../interfaces/IPlaylistService";
import type {IPlaylistDocument} from "../interfaces/IPlaylistDocument";
import type {InsertOneResult, UpdateResult, DeleteResult} from "mongodb";
import {ObjectId} from "mongodb";


export const playlistService = (input: IPlaylistService['input']) => {
    const { playlistCollection, PlaylistModule } = input;

    const service: IPlaylistService['output'] = {
        /**
         * used to send a valid playlist object to the front end to feed the form
         * @returns {Promise<IPlaylist>}
         */
        getDefaultPlaylist: async (): Promise<IPlaylist> => {
            return new PlaylistModule().generateDefaultEmptyPlaylist();
        },

        /**
         * used to send a valid playlist object made from a template,
         * updated with template values before sending to the front end to feed the form
         * @returns {Promise<IPlaylist>}
         */
        getNewPlaylistFromTemplate: async (input: { playlistTemplate: Partial<IPlaylist> }): Promise<IPlaylist> =>{
            return new PlaylistModule().generateNewPlaylistFromTemplate({ playlistTemplate: input});
        },

        /**
         * regular getPlaylist method to return all playlists
         */
        getPlaylist: async (): Promise<IPlaylistDocument[]> => {
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
        postPlaylist: async (input: { playlistData: IPlaylist; user_id: string}): Promise<InsertOneResult> => {
            try {
                const plMod = new PlaylistModule();
                const validatedPlaylist: IPlaylist = plMod.updatePlaylist({ update: input.playlistData });

                /**
                 * As it is a creation, we need to create a new default dataInformation object
                 */
                const dataInformation: IDataInformation = plMod.createDataInformationFunction({ creator_id: input.user_id });

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

        updatePlaylist: async (input: { playlistData: IPlaylist, playlist_id: string; user_id: string }): Promise<UpdateResult> =>{
            try {
                const plMod = new PlaylistModule();
                const validatedPlaylist: IPlaylist = plMod.updatePlaylist({ update: input.playlistData });

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