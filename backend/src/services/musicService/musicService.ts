import type {Music, MusicService, PostMusic} from "./interfaces_musicService";
import * as console from "console";
import {ObjectId} from "mongodb";

export const musicService = (input: MusicService['input']): MusicService['output'] => {
    const { collection } = input;

    return {
        async getMusicLibrary() {
            try {
                const result = await collection.find().toArray();
                return result;
            } catch(err) {
                console.error('Error fetching music', err);
                throw new Error('Could not fetch music');
            }
        },

        async postMusic(input: { musicData: Record<'title' | 'artist', string> }){
            try {
                return await collection.insertOne(input.musicData);
            } catch(err) {
                console.error('Error inserting music', err);
                throw new Error('Could not insert music');
            }
        },
        async updateMusic(input: { music_id: string }){
            try {
                return await collection.updateOne({ _id: new ObjectId(input.music_id) });
            } catch (err) {
                console.error('Error updating music', err);
                throw new Error('Could not update music');
            }
        },
        async deleteMusic(input: { music_id: string }) {
            try {
                return await collection.deleteOne({ _id: new ObjectId(input.music_id) });
            } catch (err) {
                console.error('Error deleting music', err);
                throw new Error('Could not delete music');
            }
        }
    };
}