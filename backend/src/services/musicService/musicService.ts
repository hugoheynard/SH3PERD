import type {MusicService} from "./interfaces_musicService";
import * as console from "console";
import {ObjectId} from "mongodb";

export const musicService = (input: MusicService['input']): MusicService['output'] => {
    const { collection, musicVersionsCollection } = input;

    return {
        async getMusicLibrary() {
            try {
                const result = await collection.aggregate([
                    {
                        $lookup: {
                            from: "music_versions",
                            localField: "_id",
                            foreignField: "referenceMusic_id",
                            as: "versions"
                        }
                    }
                ]).toArray();

                return result;
            } catch(err) {
                console.error('Error fetching music', err);
                throw new Error('Could not fetch music');
            }
        },

        //MUSIC CRUD
        async postMusic(input){
            try {
                return await collection.insertOne(input.musicData);
            } catch(err) {
                console.error('Error inserting music', err);
                throw new Error('Could not insert music');
            }
        },
        async updateMusic(input){
            try {
                return await collection.updateOne({ _id: new ObjectId(input.music_id) });
            } catch (err) {
                console.error('Error updating music', err);
                throw new Error('Could not update music');
            }
        },
        async deleteMusic(input) {
            try {
                return await collection.deleteOne({ _id: new ObjectId(input.music_id) });
            } catch (err) {
                console.error('Error deleting music', err);
                throw new Error('Could not delete music');
            }
        },

        //VERSIONS CRUD
        async postVersion(input)  {
            try {
                if (!input || !input.versionData || !input.referenceMusic_id) {
                    throw new Error('Invalid input: versionData and referenceMusic_id are required');
                }

                const result = await musicVersionsCollection.insertOne({
                    referenceMusic_id: new ObjectId(input.referenceMusic_id),
                    ...input.versionData
                });
                console.log('Version successfully added:', result.insertedId);

                return result;
            } catch (err) {
                console.error('Error adding new version', err);
                throw new Error('Could not add version');
            }
        },
        async updateVersion(input) {
            try {
                const result =  await musicVersionsCollection.updateOne(
                    { _id: new ObjectId(input.version_id) },
                    { $set: input.versionData }
                );
                console.log(`Version ${input.version_id} successfully updated`);

                return result;
            } catch (err) {
                console.error('Error updating version', err);
                throw new Error('Could not update version');
            }
        },
        async deleteVersion(input) {
            try {
                const result =  await musicVersionsCollection.deleteOne({ _id: new ObjectId(input.version_id) });
                console.log(`Version ${input.version_id} successfully updated`);

                return result;
            } catch(err) {
                console.error('Error deleting version', err);
                throw new Error('Could not delete version');
            }
        }
    };
}