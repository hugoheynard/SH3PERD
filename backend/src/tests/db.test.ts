import { Db, MongoClient } from 'mongodb';
import { connectDb} from '../db';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;
let db: Db;

beforeAll(async () => {
    mongoServer =  await MongoMemoryServer.create({
        instance: {
            dbName: 'test',
        },
    });
    const uri = mongoServer.getUri();
    mongoClient = new MongoClient(uri);

    await mongoClient.connect();
    db = mongoClient.db();
});

afterAll(async () => {
    if (mongoClient) {
        await mongoClient.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('connectDb', () => {
    it('should connect to the database successfully', async () => {

        const dbInstance = await connectDb();


        expect(dbInstance).toBeInstanceOf(Db);

        const collections = await dbInstance.collections();
        expect(collections).toBeDefined();
        expect(collections.length).toBeGreaterThan(0);  // Si des collections existent dans la DB par défaut
    });

    it('should return null if connection fails', async () => {
        jest.spyOn(MongoClient.prototype, 'connect').mockImplementationOnce(async () => {
            throw new Error('Connection failed');
        });

        const dbInstance = await connectDb();

        expect(dbInstance).toBeNull();
    });
});