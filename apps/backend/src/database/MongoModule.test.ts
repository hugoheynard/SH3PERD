import { Test, TestingModule } from '@nestjs/testing';
import { MongoClient } from 'mongodb';
import { MongoModule } from './MongoModule.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MONGO_CLIENT } from '../libs/repositories/tokens';
import { jest } from '@jest/globals';
import { TestAppModule } from '../../test/utils/TestAppModule.js';
import { getMongoClient } from './getMongoClient';



jest.mock('./getMongoClient.js', () => ({
  getMongoClient: jest.fn(() => ({ mocked: true })), // mock simple
}));

describe('MongoModule (no import)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ ATLAS_URI: 'mongodb://localhost/fake' })],
        }),
      ],
      providers: [
        {
          provide: MONGO_CLIENT,
          useValue: { mocked: true },
        },
      ],
    }).compile();
  });

  it('should inject mocked client', () => {
    const client = module.get(MONGO_CLIENT);
    expect(client).toEqual({ mocked: true });
  });
});
