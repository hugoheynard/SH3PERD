import { MongoClient } from 'mongodb';


//const atlas_uri = process.env.ATLAS_URI;
const clusterName = 'Cluster83466';
const password = 'YkRya3REd1lq';
const dbName = 'shepherd';

export const atlas_uri = `mongodb+srv://${clusterName}:${password}@${clusterName.toLowerCase()}.otv86.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${clusterName}"`;


const mongoClient = new MongoClient(atlas_uri);


export const connectDb = async (app) => {
    await mongoClient.connect();
    return mongoClient.db('shepherd');
};