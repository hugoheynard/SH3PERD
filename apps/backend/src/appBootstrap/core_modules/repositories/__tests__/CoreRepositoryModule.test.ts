import { Test, TestingModule } from '@nestjs/testing';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import type { TCoreRepositories } from './types';
import { CoreRepositoryModule } from '../CoreRepositoryModule';
import { CORE_REPOSITORY } from '../../../../libs/repositories/tokens';

describe('CoreRepositoryModule', () => {
  let module: TestingModule;
  let coreRepositories: TCoreRepositories;

  beforeAll(async () => {
    const mockClient = {} as unknown as MongoClient;
    const mockConfig = {
      get: (key: string) => (key === 'CORE_DB_NAME' ? 'test-db' : undefined),
    };

    module = await Test.createTestingModule({
      imports: [CoreRepositoryModule],
    })
      .overrideProvider(MongoClient)
      .useValue(mockClient)
      .overrideProvider(ConfigService)
      .useValue(mockConfig)
      .compile();

    coreRepositories = module.get<TCoreRepositories>(CORE_REPOSITORY);
  });

  it('should provide core repositories with expected shape', () => {
    expect(coreRepositories).toHaveProperty('refreshTokenRepository');
    expect(coreRepositories).toHaveProperty('userRepository');
    expect(coreRepositories).toHaveProperty('contractRepository');
    expect(coreRepositories).toHaveProperty('eventUnitsRepository');
    expect(coreRepositories).toHaveProperty('userRepertoireRepository');
  });
});
