import { Db, MongoClient } from 'mongodb';

/**
 * Connects to the application's core MongoDB database.
 *
 * This function establishes a single MongoDB connection using the provided URI and database name.
 * It caches the `Db` instance to prevent multiple redundant connections during the app's lifecycle.
 *
 * @param {Object} input - The configuration for the MongoDB connection.
 * @param {string | undefined} input.uri - The MongoDB connection string. Must be defined.
 * @param {string | undefined} input.dbName - The name of the MongoDB database. Must be defined.
 *
 * @returns {Promise<Db>} The connected MongoDB `Db` instance.
 *
 * @throws {Error} If the `uri` or `dbName` is not provided.
 * @throws {Error} If the connection to the database fails.
 *
 * @example
 * const db = await connectToCoreDb({
 *   uri: process.env.ATLAS_URI,
 *   dbName: process.env.DB_NAME
 * });
 */

let cachedDb: Db | null = null;

export const connectToCoreDb = async (input: {uri: string | undefined; dbName: string | undefined}): Promise<Db> => {
    const { uri, dbName } = input;

    try {
        if (!uri) {
            throw new Error("MongoDB URI is not defined");
        }
        if (!dbName) {
            throw new Error("MongoDB DB_NAME is not defined");
        }

        let client;


        if (cachedDb) {
            return cachedDb;
        }

        client = new MongoClient(uri);
        await client.connect();
        cachedDb = client.db(dbName);

        console.log("✅ Connected to db");
        return cachedDb;

    } catch (error: any) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error('Failed to connect to the database');
    }
};

export const resetCoreDbCache = () => {
    cachedDb = null
};
