import { Module } from '@nestjs/common';
import { CORE_REPOSITORIES, MONGO_CLIENT } from '../../nestTokens.js';
import { ConfigService } from '@nestjs/config';
import type { MongoClient } from 'mongodb';
import {
  createCoreRepositories,
  type TCoreRepositories,
} from '../../initFactories/createCoreRepositories.js';

@Module({
  providers: [
    {
      provide: CORE_REPOSITORIES,
      useFactory: (client: MongoClient, config: ConfigService): TCoreRepositories => {
        return createCoreRepositories({
          client,
          dbName: config.get<string>('CORE_DB_NAME'),
        });
      },
      inject: [MONGO_CLIENT, ConfigService],
    },
  ],
  exports: [CORE_REPOSITORIES],
})
export class CoreRepositoriesModule {}
