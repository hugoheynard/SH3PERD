import type {Collection, DeleteResult, InsertManyResult, InsertOneResult, ObjectId, UpdateResult} from "mongodb";

export interface MusicDocument{
    _id: ObjectId;
    title: string;
    artist: string;
}

export interface VersionDocument{
    _id: ObjectId;
    type: string;
    pitch: number;
    genre: string;
    creator_id: ObjectId;
    creation_date: Date;
    referenceMusic_id: ObjectId;
    last_modified?: Date;
    energy: string;
    effort: string;
    emergency: boolean;
}

export interface MusicService {
    input: {
        collection: Collection<any> //todo interface Music mongo
        musicVersionsCollection: Collection<any>
    },
    output: {
        getMusicLibrary: () => Promise<MusicDocument[]>;
        postMusic: (input: { musicData: Record<'title' | 'artist', string> }) => Promise<InsertManyResult<any>>;
        updateMusic: (input: { music_id: string; musicData: any }) => Promise<UpdateResult<any>>;
        deleteMusic: (input: { music_id: string }) => Promise<DeleteResult>;
        //versions
        postVersion: (input: { referenceMusic_id: string; versionData: any }) => Promise<InsertOneResult<any>>;
        updateVersion: (input: { version_id: string; versionData: any }) => Promise<UpdateResult<any>>;
        deleteVersion: (input: { version_id: string }) => Promise<DeleteResult>;
    }
}


