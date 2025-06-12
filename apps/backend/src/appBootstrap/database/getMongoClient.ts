import { MongoClient } from "mongodb";
import { Logger } from '@nestjs/common';
//import {TechnicalError} from "../utils/errorManagement/errorClasses/TechnicalError.js";


let cachedClient: MongoClient | null = null;

export const getMongoClient = async (input: { uri: string }): Promise<MongoClient> => {
    const { uri } = input;

    if (!uri) {
        throw new Error('[MONGO] URI is required but not provided');

        //throw new TechnicalError("MONGO_URI_MISSING", "MongoDB URI is not defined", 500);
    }

    if (cachedClient) {
        return cachedClient;
    }

    try {
        const client = new MongoClient(uri);
        cachedClient = await client.connect();
        Logger.log('✅ Connected to MongoDB', 'MongoClient');
        return cachedClient;
    } catch (error: any) {
        Logger.error('❌ Failed to connect to MongoDB', error, 'MongoClient');
        throw new Error('[MONGO] Initialization failed');

        //throw new TechnicalError("MONGO_CLIENT_INIT_FAILED", error.message, 500);
    }
};

export const resetMongoClientCache = () => {
    cachedClient = null;
};
