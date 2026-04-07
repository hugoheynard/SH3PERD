import { Global, Module } from '@nestjs/common';
import { getMongoClient } from './getMongoClient.js';
import { ConfigService } from '@nestjs/config';
import { type Db, MongoClient } from 'mongodb';
import { MONGO_CLIENT, MONGO_CORE_DB } from './db.tokens.js';
import { TransactionRunner } from './TransactionRunner.js';

/**
 * @module MongoModule
 * @description
 * Global NestJS module responsible for providing a singleton instance of `MongoClient`.
 * It uses a factory to create the client based on the `ATLAS_URI` defined in the application's configuration.
 *
 * This module is marked as `@Global()`, making the `MongoClient` injectable across all other modules
 * without needing to explicitly import `MongoModule`.
 *
 * @example
 * // Inject the MongoClient elsewhere:
 * constructor(@Inject(MONGO_CLIENT) private readonly client: MongoClient) {}
 */
@Global()
@Module({
  providers: [
    {
      provide: MONGO_CLIENT,
      useFactory: async (config: ConfigService): Promise<MongoClient> => {
        const uri = config.get<string>('ATLAS_URI');

        if (!uri) {
          throw new Error('MONGO_URI is not defined in the configuration');
        }

        return getMongoClient({ uri });
      },
      inject: [ConfigService],
    },
    {
      provide: MONGO_CORE_DB,
      useFactory: async (client: MongoClient, config: ConfigService): Promise<Db> => {
        return client.db(config.get<string>('CORE_DB_NAME'));
      },
      inject: [MONGO_CLIENT, ConfigService]
    },
    TransactionRunner,
  ],
  exports: [MONGO_CLIENT, MONGO_CORE_DB, TransactionRunner],
})
export class MongoModule {}
