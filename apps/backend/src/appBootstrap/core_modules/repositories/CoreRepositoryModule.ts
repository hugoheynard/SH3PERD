import { Module } from '@nestjs/common';
import { CORE_REPOSITORY, MONGO_CLIENT } from '../../../libs/repositories/tokens.js';
import { ConfigService } from '@nestjs/config';
import type { MongoClient } from 'mongodb';
import { createCoreRepositories, type TCoreRepositories } from './createCoreRepositories.js';


@Module({
  providers: [
    {
      provide: CORE_REPOSITORY,
      useFactory: (client: MongoClient, config: ConfigService): TCoreRepositories => {
        return createCoreRepositories({
          client,
          dbName: config.get<string>('CORE_DB_NAME')
        });
      },
      inject: [MONGO_CLIENT, ConfigService]
    }

  ],
  exports: [CORE_REPOSITORY]
})
export class CoreRepositoryModule {}