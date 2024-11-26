import {Db, MongoClient} from 'mongodb';


//const atlas_uri = process.env.ATLAS_URI;
const userName: string = 'Cluster83466'
const clusterName: string = 'cluster83466';
const password: string = 'YkRya3REd1lq';
const dbName: string = 'shepherd';

export const atlas_uri: string = `mongodb+srv://${userName}:${password}@${clusterName.toLowerCase()}.otv86.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${clusterName}`;

const mongoClient: MongoClient = new MongoClient(atlas_uri);


export const connectDb = async (): Promise<Db | null> => {
    try {
        await mongoClient.connect();
        console.log("Connected to db");
        return mongoClient.db('shepherd');
    } catch (error: any) {
        console.error("Error connecting to MongoDB :", error);
        return null;
    }
};