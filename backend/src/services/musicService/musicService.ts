import type {Music, MusicService, PostMusic} from "./interfaces_musicService";

export const musicService = (input: MusicService['input']): MusicService['output'] => {
    const { collection } = input;

    return {
        async getMusic(input: any) {
            try {
                return await collection.find();
            } catch(err) {
                console.error('Error fetching music', err);
                throw new Error('Could not fetch music');
            }
        },
        async postMusic(input: any) {
            try {
                return await collection.insertMany(input.musicData);
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