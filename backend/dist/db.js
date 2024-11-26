import { Db, MongoClient } from 'mongodb';
//const atlas_uri = process.env.ATLAS_URI;
const userName = 'Cluster83466';
const clusterName = 'cluster83466';
const password = 'YkRya3REd1lq';
const dbName = 'shepherd';
export const atlas_uri = `mongodb+srv://${userName}:${password}@${clusterName.toLowerCase()}.otv86.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${clusterName}`;
const mongoClient = new MongoClient(atlas_uri);
export const connectDb = async () => {
    try {
        await mongoClient.connect();
        console.log("Connected to db");
        return mongoClient.db('shepherd');
    }
    catch (error) {
        console.error("Error connecting to MongoDB :", error);
        return null;
    }
};
//# sourceMappingURL=db.js.map