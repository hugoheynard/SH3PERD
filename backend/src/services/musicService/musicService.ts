import type {Music, MusicService, PostMusic} from "./interfaces_musicService";
import * as console from "console";

export const musicService = (input: MusicService['input']): MusicService['output'] => {
    const { collection } = input;

    return {
        async getMusicLibrary() {
            try {
                return await collection.find().toArray();
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
        async updateMusic(input: any){

        },
        async deleteMusic(input: any) {
        }
    };
}