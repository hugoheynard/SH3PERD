import { MongoClient } from "mongodb";
import {TechnicalError} from "@sh3pherd/shared-utils";

let cachedClient: MongoClient | null = null;

export const getMongoClient = async (input: { uri?: string }): Promise<MongoClient> => {
    const { uri } = input;

    if (!uri) {
        throw new TechnicalError("MONGO_URI_MISSING", "MongoDB URI is not defined", 500);
    }

    if (cachedClient) {
        return cachedClient;
    }

    try {
        const client = new MongoClient(uri);
        cachedClient = await client.connect();
        console.log("✅ Connected to MongoDB");
        return cachedClient;
    } catch (error: any) {
        throw new TechnicalError("MONGO_CLIENT_INIT_FAILED", error.message, 500);
    }
};

export const resetMongoClientCache = () => {
    cachedClient = null;
};
