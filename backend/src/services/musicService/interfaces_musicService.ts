import type {Collection, InsertManyResult, ObjectId} from "mongodb";

export interface MusicService {
    input: {
        collection: Collection<any> //todo interface Music mongo
    },
    output: {
        getMusic: Promise<any>;
        postMusic: Promise<InsertManyResult<any>>;
        updateMusic: Promise<any>;
        deleteMusic: Promise<any>;
        [key: string]: any;
    }
}

export interface PostMusic {
    title: string;
    artist: string;
}

export interface MusicDocument{
    _id: ObjectId;
    title: string;
    artist: string;
}
