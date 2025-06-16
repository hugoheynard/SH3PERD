import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [() => ({
        ATLAS_URI: 'mongodb://localhost:27017/test-db',
        CORE_DB_NAME: 'test-db',
      })],
    }),
  ],
})
export class TestAppModule {}