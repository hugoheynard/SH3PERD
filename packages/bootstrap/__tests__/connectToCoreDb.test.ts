import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {connectToCoreDb, resetCoreDbCache} from "../src/connectToCoreDb";

describe('connectDb', () => {
    let mongoServer: MongoMemoryServer;
    let uri: string;
    let client: MongoClient;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'test' } });
        uri = mongoServer.getUri();
    }, 15000);

    beforeEach(() => {
        resetCoreDbCache(); // ← Important pour désactiver le cache
    });

    afterAll(async () => {
        if (client) {
            await client.close();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it('should connect to the database and return a Db instance', async () => {
        client = new MongoClient(uri);
        await client.connect();

        const db = client.db('test');
        expect(db).toBeInstanceOf(Db);
    });


    it('should reuse the same Db instance on subsequent calls', async () => {
        const db1 = await connectToCoreDb({ uri: uri, dbName: 'test' });
        const db2 = await connectToCoreDb({ uri: uri, dbName: 'test' });

        expect(db1).not.toBeNull();
        expect(db2).not.toBeNull();
        expect(db1).toBe(db2); // ✅ Singleton
    });

    it('should throw an error if connection fails', async () => {
        await expect(
            connectToCoreDb({ uri: 'mongodb://fake', dbName: 'test' })
        ).rejects.toThrow('Failed to connect to the database');
    }, 40000);




});
