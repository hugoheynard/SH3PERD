import { MongoClient } from 'mongodb';
import { TechnicalError } from '../../utils/errorManagement/TechnicalError.js';

let cachedClient: MongoClient | null = null;

export const getMongoClient = async (input: { uri: string }): Promise<MongoClient> => {
  const { uri } = input;

  if (!uri) {
    throw new Error('[MONGO] URI is required but not provided');

    //throw new TechnicalError("MONGO_URI_MISSING", { code: "MongoDB URI is not defined" });
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(uri);
    cachedClient = await client.connect();
    return cachedClient;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new TechnicalError('MongoDB connection failed', { code: 'MONGO_CLIENT_INIT_FAILED', cause: error as Error });
    }

    // fallback pour les erreurs non typées
    throw new TechnicalError('MongoDB connection failed', { code: 'MONGO_CLIENT_INIT_FAILED' });
  }
};

export const resetMongoClientCache = (): void => {
  cachedClient = null;
};
