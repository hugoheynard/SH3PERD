import type {Collection, DeleteResult, InsertManyResult, ObjectId, UpdateResult} from "mongodb";

export interface PostMusic {
    title: string;
    artist: string;
    versions: any[];
}

export interface MusicDocument{
    _id: ObjectId;
    title: string;
    artist: string;
}

export interface MusicService {
    input: {
        collection: Collection<any> //todo interface Music mongo
        musicVersionsCollection: Collection<any>
    },
    output: {
        getMusicLibrary: Promise<MusicDocument[]>;
        postMusic: Promise<InsertManyResult<any>>;
        updateMusic: Promise<UpdateResult<any>>;
        deleteMusic: Promise<DeleteResult>;
        //versions
        updateVersion: Promise<any>
        [key: string]: any;
    }
}


