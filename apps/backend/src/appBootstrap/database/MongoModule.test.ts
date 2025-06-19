import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MONGO_CLIENT } from '../nestTokens';
import { jest } from '@jest/globals';

jest.mock('./getMongoClient', () => ({
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
